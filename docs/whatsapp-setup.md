# WhatsApp setup and agents

Agents remain Kinora's saved contact, personal message draft, notes, and next planned time. Existing records and schedules are preserved. The form currently supports one date/time, not daily or weekly repetition. Instructions are notes; no AI message generator is connected.

## Enable custom sending

For the current sender, complete [delivery tracking setup](delivery-tracking-setup.md) first. Its SQL and webhook setup now precede deploying the updated sender. The steps below describe the custom-message flow after tracking is connected.

1. In Supabase, open Edge Functions → send-whatsapp-message → Code.
2. Replace its code with `supabase/functions/send-whatsapp-message/index.ts` from this repository and deploy. Do this in the existing Kinora project, not in WhatsApp Manager.
3. Keep the existing server secrets: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEST_RECIPIENT. Supabase provides SUPABASE_URL and SUPABASE_ANON_KEY. Do not put these credentials in frontend code.
4. Refresh Kinora. The composer checks the function's capabilities without sending anything. Custom sending stays disabled with the old function.
5. Choose the saved contact matching WHATSAPP_TEST_RECIPIENT. If using Meta's test sender, verify this contact in Meta's recipient list too.
6. Have the recipient message the WhatsApp business/test sender. Within the 24-hour reply window, use Review & send on an agent, check the draft and recipient, then send once. Check the receiving phone. API acceptance does not prove delivery.

The new function derives the name and phone from the signed-in user's contact. It preserves the test-recipient restriction, sends free-form text only when explicitly requested, and never falls back to a different message if Meta rejects custom text. The composer does not yet know the last inbound message time: Meta enforces the reply window, and later webhook events may report failures after acceptance.

The greeting option sends the currently approved `kinora_daily_greeting` in language `en`. Meta controls the body and footer. A template edit under review may differ from the app's illustrative preview.

## Automatic schedules: next setup

The frontend saves plans through the existing `sync_agent_scheduled_message` database function. This repository does not contain that function's definition, the live agent/schedule table migrations, or a scheduled sender worker. Delivery tracking has a separate additive migration and signed webhook. Saving a plan and activating an agent do not establish automatic sending. Manual sending does not cancel or mark a saved plan as delivered.

Before connecting automatic delivery, obtain the SQL definitions and RLS policies for agents, contacts, scheduled_messages, delivery_logs and sync_agent_scheduled_message from the current Supabase project. Do not overwrite the live schema with guessed replacements.

Then add explicit template metadata to agent/schedule records, a server worker with atomic claiming and duplicate prevention, due-time/reply-window checks, and a Meta-signature-verified webhook for inbound window and delivery tracking. Confirm how retries and ambiguous network failures should be handled before enabling the worker. Add daily/weekly recurrence with a stored timezone after one-time delivery works.

For unattended future messages outside the reply window, use approved templates. A custom message can be saved as a draft, but its delivery must be checked at the actual sending time; a scheduled time alone does not grant permission to send free-form text.
