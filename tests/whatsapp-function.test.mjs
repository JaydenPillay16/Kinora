import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../supabase/functions/send-whatsapp-message/index.ts", import.meta.url), "utf8")
  .replace(/^import .*;\s*/m, "");
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;

function harness({ user = { id: "user-1" }, contact = { name: "Alex Example", phone_number: "+27 82 123 4567" }, recipient = "27821234567", metaCode } = {}) {
  let handler;
  const sends = [];
  const filters = [];
  const query = { select() { return this; }, eq(key, value) { filters.push([key, value]); return this; }, async maybeSingle() { return { data: contact, error: null }; } };
  const env = { SUPABASE_URL: "https://example.supabase.co", SUPABASE_ANON_KEY: "anon", WHATSAPP_ACCESS_TOKEN: "secret", WHATSAPP_PHONE_NUMBER_ID: "phone-id", WHATSAPP_TEST_RECIPIENT: recipient };
  vm.runInNewContext(code, {
    Deno: { env: { get: (key) => env[key] }, serve: (fn) => { handler = fn; } },
    createClient: () => ({ auth: { getUser: async () => ({ data: { user }, error: null }) }, from: () => query }),
    Request, Response, AbortSignal,
    console: { error() {} },
    fetch: async (_url, options) => {
      sends.push(JSON.parse(options.body));
      return Response.json(metaCode ? { error: { code: metaCode } } : { messages: [{ id: "wamid.example" }] }, { status: metaCode ? 400 : 200 });
    },
  });
  return { sends, filters, request: (body) => handler(new Request("https://example.test/send", {
    method: "POST", headers: { Authorization: "Bearer test-session", Origin: "https://kinora-app-pi.vercel.app", "Content-Type": "application/json" }, body: JSON.stringify(body),
  })) };
}
const contactId = "12345678-1234-1234-1234-123456789abc";

test("capabilities never sends or looks up a contact", async () => {
  const h = harness();
  const response = await h.request({ action: "capabilities" });
  assert.equal((await response.json()).customText, true);
  assert.equal(h.sends.length, 0);
  assert.equal(h.filters.length, 0);
});
test("custom mode sends exact text to the owned contact, ignoring client recipient overrides", async () => {
  const h = harness();
  assert.equal((await h.request({ contactId, mode: "custom", message: "Love you 💚", to: "19999999999", name: "Wrong" })).status, 200);
  assert.equal(h.sends[0].type, "text");
  assert.equal(h.sends[0].to, "27821234567");
  assert.equal(h.sends[0].text.body, "Love you 💚");
  assert.ok(h.filters.some(([key, value]) => key === "user_id" && value === "user-1"));
});
test("template mode personalizes from the contact", async () => {
  const h = harness();
  await h.request({ contactId, mode: "template", name: "Wrong" });
  assert.equal(h.sends[0].template.name, "kinora_daily_greeting");
  assert.equal(h.sends[0].template.components[0].parameters[0].text, "Alex");
});
test("missing authentication does not send", async () => {
  const h = harness({ user: null });
  assert.equal((await h.request({ contactId, mode: "template" })).status, 401);
  assert.equal(h.sends.length, 0);
});
test("missing or unowned contacts do not send", async () => {
  const h = harness({ contact: null });
  assert.equal((await h.request({ contactId, mode: "template" })).status, 404);
  assert.equal(h.sends.length, 0);
});
test("test-recipient restriction remains enforced", async () => {
  const h = harness({ recipient: "19999999999" });
  assert.equal((await h.request({ contactId, mode: "template" })).status, 403);
  assert.equal(h.sends.length, 0);
});
test("empty or oversized custom text is rejected", async () => {
  const h = harness();
  for (const message of ["  ", "a".repeat(4097)]) {
    assert.equal((await h.request({ contactId, mode: "custom", message })).status, 400);
  }
  assert.equal(h.sends.length, 0);
});
test("closed reply window gives an error without a fallback send", async () => {
  const h = harness({ metaCode: 131047 });
  const response = await h.request({ contactId, mode: "custom", message: "Hello" });
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /reply window is closed/);
  assert.equal(h.sends.length, 1);
});
