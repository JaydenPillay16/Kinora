import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = ["http://localhost:5173", "https://kinora-app-pi.vercel.app"];

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (allowedOrigins.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (origin && !allowedOrigins.includes(origin)) return reply({ error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !anonKey) return reply({ error: "Server configuration is incomplete" }, 500);
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return reply({ error: "Authentication required" }, 401);
    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return reply({ error: "Invalid session" }, 401);

    let payload: unknown;
    try { payload = await req.json(); } catch { return reply({ error: "Invalid JSON body" }, 400); }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return reply({ error: "Invalid request" }, 400);
    const body = payload as Record<string, unknown>;
    const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const testRecipient = Deno.env.get("WHATSAPP_TEST_RECIPIENT");

    // A capability check is read-only and must never send a message.
    if (body.action === "capabilities") return reply({ customText: Boolean(token && phoneId && testRecipient) });
    if (body.action !== undefined) return reply({ error: "Invalid action" }, 400);
    if (!token || !phoneId || !testRecipient) return reply({ error: "Server configuration is incomplete" }, 500);
    const mode = body.mode ?? "template";
    if (mode !== "template" && mode !== "custom") return reply({ error: "Invalid message type" }, 400);
    if (typeof body.contactId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.contactId)) return reply({ error: "Choose a saved contact" }, 400);
    if (mode === "custom" && (typeof body.message !== "string" || !body.message.trim() || body.message.length > 4096)) {
      return reply({ error: "Write a message of up to 4,096 characters" }, 400);
    }

    // Derive the recipient and personalization from this user's saved contact.
    const { data: contact, error: contactError } = await supabase.from("contacts")
      .select("name, phone_number").eq("id", body.contactId).eq("user_id", user.id).maybeSingle();
    if (contactError) return reply({ error: "Unable to load the contact. Try again." }, 500);
    if (!contact) return reply({ error: "Contact not found" }, 404);
    const to = String(contact.phone_number ?? "").replace(/\D/g, "");
    const name = String(contact.name ?? "").trim().split(/\s+/)[0];
    if (!/^[1-9]\d{7,14}$/.test(to) || !name || name.length > 100) return reply({ error: "The contact needs a valid name and international phone number" }, 400);
    if (to !== testRecipient) return reply({ error: "Recipient is not allowed for testing" }, 403);

    const messagePayload = mode === "custom"
      ? { type: "text", text: { preview_url: false, body: (body.message as string).trim() } }
      : { type: "template", template: {
        name: "kinora_daily_greeting", language: { code: "en" },
        components: [{ type: "body", parameters: [{ type: "text", text: name }] }],
      } };
    const response = await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, ...messagePayload }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok) {
      const code = result?.error?.code;
      console.error("WhatsApp API error", { status: response.status, code });
      const errors: Record<number, string> = {
        190: "The WhatsApp access token is invalid or expired. Update it in Supabase.",
        131030: "Add and verify this recipient in Meta's test phone number list.",
        131047: "The WhatsApp reply window is closed. Use an approved greeting, or have the recipient message your business number first.",
        132001: "The approved template or language was not found. Check it in WhatsApp Manager.",
      };
      return reply({ error: errors[code] ?? "WhatsApp rejected the message. Check the function logs for its error code.", code }, 502);
    }
    const messageId = result.messages?.[0]?.id;
    if (!messageId) return reply({ error: "WhatsApp did not return a message ID" }, 502);
    return reply({ success: true, messageId });
  } catch {
    console.error("WhatsApp request failed before completion");
    return reply({ error: "Unable to complete the WhatsApp request. Check delivery before retrying." }, 502);
  }
});
