# Kinora

Kinora is a personal messaging workspace for keeping in touch with the people who matter. It lets you organize contacts, create messaging agents, plan messages, and send a WhatsApp test message through a Supabase Edge Function.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable key.
3. Start the development server with `npm run dev`.

The app uses React, TypeScript, Vite, Tailwind CSS, Lucide icons, and Supabase Auth/Database.

## Supabase setup

The frontend expects these project resources to exist:

- `contacts`, `agents`, `scheduled_messages`, and `delivery_logs` tables with user-scoped access policies.
- The `sync_agent_scheduled_message` database function used when agents change.
- The `send-whatsapp-message` Edge Function used by the WhatsApp test panel.

Follow [delivery tracking setup](docs/delivery-tracking-setup.md): apply the additive tracking migration, deploy and configure the signed webhook, then deploy the sender. This repository includes tracking tables and webhook/sender source. The live agent/schedule schema, schedule RPC definition, and automatic worker still need to be connected separately. History counts only delivery confirmed by Meta and shows new messages after tracking is enabled. Agents save plans; automatic delivery requires the server worker. Keep WhatsApp credentials server-only; never put provider secrets in `VITE_` variables. If email confirmation is enabled in Supabase Auth, new users confirm their email before signing in.

## Commands

- `npm run dev` — start the local development server.
- `npm run build` — type-check and create a production build in `dist/`.
- `npm run lint` — run Oxlint.
- `npm test` — check sender/webhook behavior and PostgreSQL delivery ordering and access rules without sending real messages.
- `npm run check:functions` — type-check server functions locally against the installed Supabase SDK.
- `npm run preview` — preview the production build locally.
