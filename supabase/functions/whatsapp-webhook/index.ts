import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  if (req.method === "GET") {
    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
    if (!verifyToken) return new Response("Webhook configuration incomplete", { status: 503 });
    const challenge = url.searchParams.get("hub.challenge");
    if (url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === verifyToken && challenge !== null) {
      return new Response(challenge, { headers: { "Content-Type": "text/plain" } });
    }
    return new Response("Verification failed", { status: 403 });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("WHATSAPP_APP_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  if (!secret || !supabaseUrl || !serviceKey || !phoneId) return new Response("Webhook configuration incomplete", { status: 503 });
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return new Response("Invalid signature", { status: 401 });
  try {
    const raw = await req.arrayBuffer();
    if (raw.byteLength > 1_048_576) return new Response("Payload too large", { status: 413 });
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const bytes = Uint8Array.from(signature.slice(7).match(/.{2}/g)!, (byte) => parseInt(byte, 16));
    if (!await crypto.subtle.verify("HMAC", key, bytes, raw)) return new Response("Invalid signature", { status: 401 });
    let payload;
    try { payload = JSON.parse(new TextDecoder().decode(raw)); } catch { return new Response("Invalid JSON", { status: 400 }); }
    if (payload?.object !== "whatsapp_business_account") return new Response("Ignored");
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    for (const entry of Array.isArray(payload.entry) ? payload.entry : []) {
      for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
        const value = change?.value;
        if (change?.field !== "messages" || value?.metadata?.phone_number_id !== phoneId) continue;
        for (const status of Array.isArray(value.statuses) ? value.statuses : []) {
          if (!["sent", "delivered", "read", "failed"].includes(status?.status)) continue;
          const seconds = Number(status.timestamp);
          if (typeof status.id !== "string" || !status.id || !Number.isFinite(seconds) || seconds <= 0 || seconds > 8_640_000_000_000) {
            return new Response("Invalid status event", { status: 400 });
          }
          const errorCode = status.errors?.[0]?.code;
          const { error } = await admin.rpc("kinora_record_whatsapp_status", {
            p_phone_id: phoneId, p_message_id: status.id, p_status: status.status,
            p_event_at: new Date(seconds * 1000).toISOString(),
            p_error_code: Number.isSafeInteger(errorCode) && errorCode >= 0 && errorCode <= 2147483647 ? errorCode : null,
          });
          if (error) {
            console.error("Unable to persist WhatsApp status", { code: error.code });
            // Meta retries unsuccessful deliveries. Do not acknowledge an event we lost.
            return new Response("Unable to store status", { status: 503 });
          }
        }
      }
    }
    return new Response("EVENT_RECEIVED");
  } catch {
    console.error("Webhook processing failed");
    return new Response("Unable to process webhook", { status: 503 });
  }
});
