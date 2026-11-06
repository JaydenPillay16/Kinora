-- Additive WhatsApp tracking. Existing agents/schedules/delivery_logs are untouched.
begin;

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid,
  contact_name text not null,
  mode text not null check (mode in ('template', 'custom')),
  message_text text,
  template_name text,
  phone_number_id text not null,
  provider_message_id text unique,
  status text not null default 'sending' check (status in ('sending','accepted','sent','delivered','read','failed','unknown')),
  error_code integer,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  provider_status_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz
);
create index whatsapp_messages_user_created on public.whatsapp_messages(user_id, created_at desc);
alter table public.whatsapp_messages enable row level security;
revoke all on public.whatsapp_messages from anon, authenticated;
grant select on public.whatsapp_messages to authenticated;
grant all on public.whatsapp_messages to service_role;
create policy whatsapp_messages_read_own on public.whatsapp_messages for select to authenticated
  using ((select auth.uid()) = user_id);

-- Durable receipt inbox also holds events that arrive before the sender saves its wamid.
create table public.whatsapp_status_events (
  phone_number_id text not null,
  provider_message_id text not null,
  status text not null check (status in ('sent','delivered','read','failed')),
  event_at timestamptz not null,
  error_code integer,
  received_at timestamptz not null default now(),
  primary key (phone_number_id, provider_message_id, status, event_at)
);
alter table public.whatsapp_status_events enable row level security;
revoke all on public.whatsapp_status_events from anon, authenticated;
grant all on public.whatsapp_status_events to service_role;

create function public.kinora_apply_whatsapp_status(p_phone_id text, p_message_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare event record;
begin
  select * into event from public.whatsapp_status_events
    where phone_number_id = p_phone_id and provider_message_id = p_message_id
    order by case status when 'read' then 4 when 'delivered' then 3 when 'failed' then 2 when 'sent' then 1 end desc,
      event_at desc limit 1;
  if not found then return; end if;
  update public.whatsapp_messages m set
    status = event.status, provider_status_at = event.event_at, updated_at = now(),
    error_code = case when event.status = 'failed' then event.error_code else null end,
    error_message = case when event.status = 'failed' then 'WhatsApp reported a delivery failure.' else null end,
    delivered_at = (select min(event_at) from public.whatsapp_status_events where phone_number_id = p_phone_id and provider_message_id = p_message_id and status in ('delivered','read')),
    read_at = (select min(event_at) from public.whatsapp_status_events where phone_number_id = p_phone_id and provider_message_id = p_message_id and status = 'read')
  where m.phone_number_id = p_phone_id and m.provider_message_id = p_message_id;
end;
$$;

create function public.kinora_record_whatsapp_status(p_phone_id text, p_message_id text, p_status text, p_event_at timestamptz, p_error_code integer default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_phone_id || ':' || p_message_id, 0));
  insert into public.whatsapp_status_events(phone_number_id, provider_message_id, status, event_at, error_code)
    values (p_phone_id, p_message_id, p_status, p_event_at, p_error_code) on conflict do nothing;
  perform public.kinora_apply_whatsapp_status(p_phone_id, p_message_id);
end;
$$;

create function public.kinora_attach_whatsapp_message(p_id uuid, p_message_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare phone_id text;
begin
  select phone_number_id into strict phone_id from public.whatsapp_messages where id = p_id;
  perform pg_advisory_xact_lock(hashtextextended(phone_id || ':' || p_message_id, 0));
  update public.whatsapp_messages set provider_message_id = p_message_id,
    status = 'accepted', updated_at = now() where id = p_id;
  perform public.kinora_apply_whatsapp_status(phone_id, p_message_id);
end;
$$;

-- Only trusted server functions may write receipts or attach Meta message IDs.
revoke all on function public.kinora_apply_whatsapp_status(text,text) from public, anon, authenticated;
revoke all on function public.kinora_record_whatsapp_status(text,text,text,timestamptz,integer) from public, anon, authenticated;
revoke all on function public.kinora_attach_whatsapp_message(uuid,text) from public, anon, authenticated;
grant execute on function public.kinora_record_whatsapp_status(text,text,text,timestamptz,integer) to service_role;
grant execute on function public.kinora_attach_whatsapp_message(uuid,text) to service_role;
commit;
