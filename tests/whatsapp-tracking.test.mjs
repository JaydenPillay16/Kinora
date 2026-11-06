import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(new URL("../supabase/migrations/202611060001_whatsapp_delivery_tracking.sql", import.meta.url), "utf8");
const owner = "11111111-1111-1111-1111-111111111111";
const other = "22222222-2222-2222-2222-222222222222";
const db = new PGlite();
test.before(async () => {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
    insert into auth.users values ('${owner}'), ('${other}');
  `);
  await db.exec(migration);
});
test.after(async () => { await db.close(); });

async function attempt(user = owner) {
  const { rows } = await db.query("insert into public.whatsapp_messages(user_id,contact_name,mode,phone_number_id) values ($1,'Alex','template','phone') returning id", [user]);
  return rows[0].id;
}
async function attach(id, message) {
  await db.query("select public.kinora_attach_whatsapp_message($1,$2)", [id, message]);
}
async function receipt(message, status, seconds = 0, code = null) {
  await db.query("select public.kinora_record_whatsapp_status('phone',$1,$2,$3,$4)", [message, status, new Date(1793918004000 + seconds * 1000).toISOString(), code]);
}
async function state(id) { return (await db.query("select * from public.whatsapp_messages where id=$1", [id])).rows[0]; }

test("receipts arriving before sender finalization are reconciled", async () => {
  const id = await attempt();
  await receipt("early", "delivered");
  await attach(id, "early");
  assert.equal((await state(id)).status, "delivered");
});
test("duplicate receipts are idempotent and out-of-order events cannot regress delivery", async () => {
  const id = await attempt();
  await attach(id, "ordered");
  await receipt("ordered", "read", 3);
  await receipt("ordered", "read", 3);
  await receipt("ordered", "sent", 1);
  await receipt("ordered", "delivered", 2);
  const message = await state(id);
  assert.equal(message.status, "read");
  assert.equal(new Date(message.delivered_at).getTime(), 1793918006000);
  assert.equal((await db.query("select count(*)::int as count from public.whatsapp_status_events where provider_message_id='ordered'")).rows[0].count, 3);
});
test("failure supersedes sent, preserves code, and cannot override confirmed delivery", async () => {
  const id = await attempt();
  await attach(id, "failure");
  await receipt("failure", "sent", 1);
  await receipt("failure", "failed", 2, 131047);
  assert.equal((await state(id)).status, "failed");
  assert.equal((await state(id)).error_code, 131047);
  await receipt("failure", "delivered", 3);
  await receipt("failure", "failed", 4, 131026);
  assert.equal((await state(id)).status, "delivered");
  assert.equal((await state(id)).error_code, null);
});
test("authenticated user reads only own history and cannot write statuses or call server RPCs", async () => {
  const ownId = await attempt();
  const otherId = await attempt(other);
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${owner}';`);
  try {
    const { rows } = await db.query("select id from public.whatsapp_messages where id in ($1,$2)", [ownId, otherId]);
    assert.deepEqual(rows.map((row) => row.id), [ownId]);
    await assert.rejects(db.query("update public.whatsapp_messages set status='delivered' where id=$1", [ownId]), /permission denied/);
    await assert.rejects(db.query("select public.kinora_attach_whatsapp_message($1,'forged')", [ownId]), /permission denied/);
    await assert.rejects(db.query("select public.kinora_record_whatsapp_status('phone','forged','read',now(),null)"), /permission denied/);
    await assert.rejects(db.query("select * from public.whatsapp_status_events"), /permission denied/);
  } finally { await db.exec("reset role; reset request.jwt.claim.sub;"); }
});
test("service role can record and finalize delivery events", async () => {
  const id = await attempt();
  await db.exec("set role service_role");
  try {
    await receipt("server", "delivered");
    await attach(id, "server");
    assert.equal((await state(id)).status, "delivered");
  } finally { await db.exec("reset role"); }
});
