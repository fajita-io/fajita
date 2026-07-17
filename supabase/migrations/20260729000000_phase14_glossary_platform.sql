-- Phase 14: glossary feedback and search no-result storage.
-- RLS enabled with no policies: only service-role writes from the app.

create table if not exists public.glossary_feedback (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  helpful boolean not null,
  reason text,
  comment text,
  content_version text not null,
  resolution_state text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists glossary_feedback_created_at_idx
  on public.glossary_feedback (created_at desc);

create index if not exists glossary_feedback_slug_idx
  on public.glossary_feedback (slug);

alter table public.glossary_feedback enable row level security;

create table if not exists public.glossary_search_no_result (
  id uuid primary key default gen_random_uuid(),
  redacted_query text not null,
  glossary_version text not null,
  created_at timestamptz not null default now()
);

create index if not exists glossary_search_no_result_created_at_idx
  on public.glossary_search_no_result (created_at desc);

alter table public.glossary_search_no_result enable row level security;
