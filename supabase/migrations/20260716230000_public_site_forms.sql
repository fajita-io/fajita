-- Public-site form storage: early access signups and contact messages.
-- Written only by the server (service role) through validated API routes.
-- RLS is enabled with no policies: anon and authenticated roles have no
-- access at all; the service role bypasses RLS by design.

create table if not exists public.early_access_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'signup',
  created_at timestamptz not null default now(),
  constraint early_access_signups_email_len check (char_length(email) <= 320),
  constraint early_access_signups_source_len check (char_length(source) <= 64)
);

-- One row per address; repeat signups are idempotent upserts.
create unique index if not exists early_access_signups_email_key
  on public.early_access_signups (lower(email));

alter table public.early_access_signups enable row level security;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  name text,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint contact_messages_topic_check
    check (topic in ('product', 'support', 'security', 'partnership', 'acquisition')),
  constraint contact_messages_email_len check (char_length(email) <= 320),
  constraint contact_messages_name_len check (char_length(name) <= 200),
  constraint contact_messages_message_len check (char_length(message) between 1 and 5000)
);

alter table public.contact_messages enable row level security;
