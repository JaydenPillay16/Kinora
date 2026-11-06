import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHmac, webcrypto } from "node:crypto";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../supabase/functions/whatsapp-webhook/index.ts", import.meta.url), "utf8").replace(/^import .*;\s*/m, "");
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
function harness({ dbError = null } = {}) {
  let handler;
  const events = [];
  const env = { WHATSAPP_APP_SECRET: "app-secret", WHATSAPP_VERIFY_TOKEN: "verify-me", SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "server-key", WHATSAPP_PHONE_NUMBER_ID: "phone-id" };
  vm.runInNewContext(code, {
    Deno: { env: { get: (key) => env[key] }, serve: (fn) => { handler = fn; } },
    createClient: () => ({ rpc: async (name, params) => { events.push([name, params]); return { error: dbError }; } }),
    Request, Response, URL, crypto: webcrypto, TextEncoder, TextDecoder, console: { error() {} },
  });
  return { events, handler, post: (body, signature) => {
    const raw = typeof body === "string" ? body : JSON.stringify(body);
    const signed = signature ?? `sha256=${createHmac("sha256", "app-secret").update(raw).digest("hex")}`;
    return handler(new Request("https://example.test/webhook", { method: "POST", headers: { "x-hub-signature-256": signed }, body: raw }));
  } };
}
function payload(statuses, phone = "phone-id") {
  return { object: "whatsapp_business_account", entry: [{ changes: [{ field: "messages", value: { metadata: { phone_number_id: phone }, statuses } }] }] };
}
const delivered = { id: "wamid.1", status: "delivered", timestamp: "1793918004" };
test("Meta GET verification echoes challenge only with matching token", async () => {
  const h = harness();
  const ok = await h.handler(new Request("https://example.test/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=1234"));
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), "1234");
  assert.equal((await h.handler(new Request("https://example.test/webhook?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=1234"))).status, 403);
});
test("missing, incorrect and tampered signatures cannot change statuses", async () => {
  const h = harness();
  assert.equal((await h.handler(new Request("https://example.test/webhook", { method: "POST", body: "{}" }))).status, 401);
  assert.equal((await h.post(payload([delivered]), "sha256=" + "0".repeat(64))).status, 401);
  const signature = "sha256=" + createHmac("sha256", "app-secret").update("{}").digest("hex");
  assert.equal((await h.post(payload([delivered]), signature)).status, 401);
  assert.equal(h.events.length, 0);
});
test("valid signed batches persist each supported event", async () => {
  const h = harness();
  const failed = { id: "wamid.2", status: "failed", timestamp: "1793918005", errors: [{ code: 131047 }] };
  assert.equal((await h.post(payload([delivered, failed]))).status, 200);
  assert.equal(h.events.length, 2);
  assert.equal(h.events[0][0], "kinora_record_whatsapp_status");
  assert.equal(h.events[0][1].p_status, "delivered");
  assert.equal(h.events[1][1].p_error_code, 131047);
});
test("events for another sender number are ignored", async () => {
  const h = harness();
  assert.equal((await h.post(payload([delivered], "another-phone"))).status, 200);
  assert.equal(h.events.length, 0);
});
test("database failure returns retryable response", async () => {
  const h = harness({ dbError: { code: "connection" } });
  assert.equal((await h.post(payload([delivered]))).status, 503);
});
test("signed malformed JSON or status data is rejected", async () => {
  const h = harness();
  assert.equal((await h.post("not json")).status, 400);
  assert.equal((await h.post(payload([{ ...delivered, timestamp: "bad" }]))).status, 400);
  assert.equal(h.events.length, 0);
});
