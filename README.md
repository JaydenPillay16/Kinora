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

Database migrations and Edge Function source are not included in this folder. Configure the Edge Function with the WhatsApp Business credentials on the server; never put provider secrets in `VITE_` variables. If email confirmation is enabled in Supabase Auth, new users confirm their email before signing in.

## Commands

- `npm run dev` — start the local development server.
- `npm run build` — type-check and create a production build in `dist/`.
- `npm run lint` — run Oxlint.
- `npm run preview` — preview the production build locally.
