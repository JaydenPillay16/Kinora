# Connect WhatsApp delivery tracking

The frontend shows new outgoing requests and statuses from Meta. Previously sent tests are not backfilled. This setup does not enable agent automation or recurrence.

## 1. Add the tracking tables

In the existing Kinora Supabase project, open SQL Editor, create a new query, and paste the entire contents of `supabase/migrations/202611060001_whatsapp_delivery_tracking.sql`. Run it once. It creates separate tables and server functions; existing agent, contact, schedule, and delivery_logs tables are not modified. If it fails, stop and inspect the error before deploying the new sender.

Users can read only their own messages. Only the server's service role can write message attempts and webhook receipts. The private receipt inbox preserves early callbacks and deduplicates repeated events. Out-of-order sent/failed events cannot regress delivered/read statuses. Read counts as delivered for the dashboard total.

## 2. Add Meta's app secret

In Meta for Developers, select the same app used by Kinora, open App settings → Basic, and find App secret. In Supabase Edge Function secrets, save it as `WHATSAPP_APP_SECRET`. This is different from the WhatsApp access token and the webhook verify token. Never paste secrets into chat, GitHub, or frontend environment variables.

Keep `WHATSAPP_VERIFY_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` as already configured. Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. The service-role key must remain server-only.

## 3. Deploy the webhook

Create an Edge Function named `whatsapp-webhook` (or replace its code if that function already exists). Paste all of `supabase/functions/whatsapp-webhook/index.ts`, deploy, and turn OFF the platform's “Verify JWT”/“Enforce JWT verification” setting for this webhook. Meta doesn't send Supabase user tokens: the function validates its signed POST requests using the Meta app secret instead. Keep the sender's authentication unchanged.

For CLI deployments, `supabase/config.toml` contains the webhook JWT setting. Equivalent explicit command: `supabase functions deploy whatsapp-webhook --no-verify-jwt --project-ref tqjheqlfpnygrumnlkuo`.

## 4. Connect Meta

In the app's WhatsApp Configuration/Webhooks screen, set the callback URL to:

`https://tqjheqlfpnygrumnlkuo.supabase.co/functions/v1/whatsapp-webhook`

Use the same verify-token value stored in Supabase's `WHATSAPP_VERIFY_TOKEN`, then Verify and save. Subscribe to the `messages` webhook field, which includes outgoing message statuses. Ensure the app is subscribed to the WhatsApp Business Account that owns the configured phone-number ID; verifying the callback alone is not enough to receive real events. Do not share the verify-token value.

GET challenge verification proves the callback can be reached. Actual signed message-status POSTs prove the subscription and app secret are correct. Unrelated phone-number events are ignored.

## 5. Deploy the updated sender

Replace the code in the existing `send-whatsapp-message` function with the full contents of `supabase/functions/send-whatsapp-message/index.ts` and deploy. It saves an attempt before sending, then attaches Meta's message ID. With missing tracking tables it stops before sending. An ambiguous connection failure is recorded as Unconfirmed; do not automatically retry such messages.

The test-recipient restriction and Meta test-number allowlist still apply. Custom text still needs an inbound message from the recipient within 24 hours.

## 6. Confirm one real delivery

After the GitHub/Vercel frontend deployment, refresh Kinora. Send one greeting to the allowed recipient. History should show Accepted, then Sent/Delivered, and Read when Meta supplies a receipt. It refreshes every 10 seconds while visible and when you return to the app. There is also a Refresh button. No Realtime/publication setup is needed.

If the receiving phone gets the message but history stays Accepted, check the webhook's POST logs and Meta's messages subscription. A `401` points to an invalid/missing signature or app-secret mismatch; `503` points to missing configuration or failed database writes. The webhook returns a retryable failure if a receipt cannot be saved. If Meta accepts but later rejects delivery, history shows Failed and the available error code.

Webhook setup cannot promise a read receipt: Meta may not provide one. API acceptance alone never counts as delivered. Manual sends do not cancel or complete saved agent schedules.

## Local checks

`npm test` runs mocked sender/webhook checks and executes the actual SQL migration and delivery-order/access rules against an isolated in-memory PostgreSQL instance. No live Supabase project or WhatsApp recipient is contacted. `npm run build` and `npm run lint` check the frontend and repository code; `npm run check:functions` type-checks both server functions against the installed Supabase SDK. A real Meta callback still needs the live setup above.
