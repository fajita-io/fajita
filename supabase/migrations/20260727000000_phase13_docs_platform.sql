-- Phase 13: documentation platform storage.
--
-- Two small tables support the documentation platform:
--   docs_feedback         page-level "was this helpful" plus sanitized detail
--   docs_search_no_result aggregate record of queries that returned nothing
--
-- Both are written only by the server (service role) after sanitization. RLS
-- is enabled with no policies so no normal client can read or write them; the
-- service-role client bypasses RLS and is the only writer, matching the
-- pattern used by billing tables. No customer identity is stored: feedback is
-- anonymous by design and search text is redacted before it ever arrives here.

create table if not exists public.docs_feedback (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  helpful boolean not null,
  reason text,
  comment text,
  docs_version text not null,
  product_version text,
  resolution_state text not null default 'open'
    check (resolution_state in ('open', 'reviewed', 'resolved', 'archived')),
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.docs_feedback is
  'Anonymous, sanitized documentation page feedback. Server-write only.';

create index if not exists docs_feedback_slug_idx on public.docs_feedback (slug);
create index if not exists docs_feedback_state_idx on public.docs_feedback (resolution_state);
create index if not exists docs_feedback_created_idx on public.docs_feedback (created_at desc);

alter table public.docs_feedback enable row level security;

create table if not exists public.docs_search_no_result (
  id uuid primary key default gen_random_uuid(),
  -- Redacted query text only. Never a raw, potentially sensitive query.
  redacted_query text not null,
  docs_version text not null,
  created_at timestamptz not null default now()
);

comment on table public.docs_search_no_result is
  'Aggregate no-result search queries, redacted before storage. Server-write only.';

create index if not exists docs_search_no_result_created_idx
  on public.docs_search_no_result (created_at desc);

alter table public.docs_search_no_result enable row level security;
