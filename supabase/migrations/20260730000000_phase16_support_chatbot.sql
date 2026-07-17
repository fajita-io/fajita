-- Phase 16: Ask Fajita support chatbot local metadata.
-- Pamphlet remains the approved conversation provider when a verified API
-- contract exists. Until then, Fajita stores minimal local records and answers
-- from approved knowledge. Full message bodies are not stored by default.
--
-- RLS enabled with no customer policies: the Next.js app uses the service role
-- after Clerk authorization checks (same pattern as glossary feedback tables).

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'pamphlet',
  provider_conversation_id text,
  user_id text,
  organization_id uuid references public.organizations (id) on delete set null,
  session_id text,
  mode text not null check (mode in ('public', 'authenticated')),
  state text not null default 'new',
  handoff_state text not null default 'none',
  intent text,
  product_area text,
  title text,
  visibility text not null default 'private_user',
  redaction_state text not null default 'clean',
  retention_class text not null default 'authenticated_support',
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  deleted_at timestamptz
);

create index if not exists support_conversations_user_id_idx
  on public.support_conversations (user_id)
  where deleted_at is null;
create index if not exists support_conversations_org_id_idx
  on public.support_conversations (organization_id)
  where deleted_at is null;
create index if not exists support_conversations_state_idx
  on public.support_conversations (state);
create index if not exists support_conversations_last_activity_idx
  on public.support_conversations (last_activity_at desc);
create index if not exists support_conversations_provider_id_idx
  on public.support_conversations (provider_conversation_id);

alter table public.support_conversations enable row level security;

create table if not exists public.support_conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations (id) on delete cascade,
  participant_type text not null,
  participant_ref text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_participants_conversation_idx
  on public.support_conversation_participants (conversation_id);

alter table public.support_conversation_participants enable row level security;

create table if not exists public.support_messages_metadata (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations (id) on delete cascade,
  provider_message_id text,
  message_type text not null,
  author_type text not null check (author_type in ('user', 'automated', 'human', 'system')),
  sequence int not null default 0,
  has_body_local boolean not null default false,
  redacted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists support_messages_conversation_idx
  on public.support_messages_metadata (conversation_id, sequence);

alter table public.support_messages_metadata enable row level security;

create table if not exists public.support_message_sources (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.support_messages_metadata (id) on delete cascade,
  source_id text not null,
  source_url text not null,
  source_title text not null,
  created_at timestamptz not null default now()
);

alter table public.support_message_sources enable row level security;

create table if not exists public.support_handoffs (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations (id) on delete cascade,
  routing_tag text not null,
  status text not null default 'requested',
  contact_email_hash text,
  summary_redacted text,
  provider_handoff_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_handoffs_conversation_idx
  on public.support_handoffs (conversation_id);

alter table public.support_handoffs enable row level security;

create table if not exists public.support_feedback (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations (id) on delete cascade,
  message_id uuid references public.support_messages_metadata (id) on delete set null,
  helpful boolean not null,
  reasons text[] not null default '{}',
  comment_redacted text,
  created_at timestamptz not null default now()
);

alter table public.support_feedback enable row level security;

create table if not exists public.support_intents (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations (id) on delete cascade,
  intent text not null,
  confidence_bucket text,
  created_at timestamptz not null default now()
);

alter table public.support_intents enable row level security;

create table if not exists public.support_redactions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations (id) on delete cascade,
  message_meta_id uuid references public.support_messages_metadata (id) on delete set null,
  detection_type text not null,
  created_at timestamptz not null default now()
);

alter table public.support_redactions enable row level security;

create table if not exists public.support_safety_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.support_conversations (id) on delete set null,
  event_type text not null,
  severity text not null default 'info',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.support_safety_events enable row level security;

create table if not exists public.support_account_context_access (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.support_conversations (id) on delete set null,
  user_id text not null,
  organization_id uuid not null,
  tool_name text not null,
  result_category text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_account_access_org_idx
  on public.support_account_context_access (organization_id, created_at desc);

alter table public.support_account_context_access enable row level security;

create table if not exists public.support_knowledge_syncs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  sync_state text not null,
  provider_ref text,
  content_version text not null,
  error_category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_knowledge_syncs_source_idx
  on public.support_knowledge_syncs (source_id, updated_at desc);

alter table public.support_knowledge_syncs enable row level security;

create table if not exists public.support_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'pamphlet',
  event_id text not null,
  event_type text not null,
  processed_at timestamptz not null default now(),
  payload_category text,
  unique (provider, event_id)
);

alter table public.support_provider_events enable row level security;

create table if not exists public.support_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  dry_run boolean not null default true,
  differences_count int not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.support_reconciliation_runs enable row level security;

create table if not exists public.support_documentation_gaps (
  id uuid primary key default gen_random_uuid(),
  sanitized_question text not null,
  intent text,
  product_area text,
  frequency int not null default 1,
  severity text not null default 'medium',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_documentation_gaps enable row level security;

create table if not exists public.support_leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.support_conversations (id) on delete set null,
  email_hash text,
  company_name text,
  monitor_count_band text,
  team_size_band text,
  custom_domain_need boolean,
  source_page text,
  created_at timestamptz not null default now()
);

alter table public.support_leads enable row level security;
