-- Phase 9: row-level security for subscriber tables.
--
-- Same trust model as Phases 4-8:
--   * Every write goes through the service role after an explicit TypeScript
--     permission check. There is NO authenticated write policy on any table.
--   * Anonymous visitors never read subscriber data. The public form and
--     preference center use controlled server endpoints with the service role.
--   * PII-bearing surfaces (subscriber emails, consent request metadata,
--     preference/confirmation token hashes) have NO authenticated read policy:
--     the app decrypts and masks them server-side only after a
--     subscriber.read_sensitive permission check.
--   * Operational tables that carry NO email (events, delivery intents/attempts,
--     dead letters, suppressions, provider events, import/export jobs) get an
--     org-member SELECT policy so the app can render dashboards; they still hold
--     no plaintext address.

alter table public.status_page_subscriber_event_prefs enable row level security;
alter table public.status_page_subscriber_components enable row level security;
alter table public.status_page_subscriber_preference_tokens enable row level security;
alter table public.status_page_subscriber_consent_records enable row level security;
alter table public.status_page_subscriber_events enable row level security;
alter table public.status_page_subscriber_delivery_deduplication enable row level security;
alter table public.status_page_subscriber_delivery_intents enable row level security;
alter table public.status_page_subscriber_delivery_attempts enable row level security;
alter table public.status_page_subscriber_delivery_dead_letters enable row level security;
alter table public.status_page_subscriber_delivery_suppressions enable row level security;
alter table public.status_page_subscriber_suppressions enable row level security;
alter table public.status_page_subscriber_provider_events enable row level security;
alter table public.status_page_subscriber_import_jobs enable row level security;
alter table public.status_page_subscriber_export_jobs enable row level security;

-- ---------------------------------------------------------------------------
-- Operational, non-PII tables: org-member SELECT only. No writes.
-- ---------------------------------------------------------------------------
drop policy if exists sps_events_select_member on public.status_page_subscriber_events;
create policy sps_events_select_member on public.status_page_subscriber_events
  for select to authenticated using (app.is_org_member(organization_id));

drop policy if exists sps_intents_select_member on public.status_page_subscriber_delivery_intents;
create policy sps_intents_select_member on public.status_page_subscriber_delivery_intents
  for select to authenticated using (app.is_org_member(organization_id));

drop policy if exists sps_attempts_select_member on public.status_page_subscriber_delivery_attempts;
create policy sps_attempts_select_member on public.status_page_subscriber_delivery_attempts
  for select to authenticated using (app.is_org_member(organization_id));

drop policy if exists sps_dead_letters_select_member on public.status_page_subscriber_delivery_dead_letters;
create policy sps_dead_letters_select_member on public.status_page_subscriber_delivery_dead_letters
  for select to authenticated using (app.is_org_member(organization_id));

drop policy if exists sps_delivery_suppressions_select_member on public.status_page_subscriber_delivery_suppressions;
create policy sps_delivery_suppressions_select_member on public.status_page_subscriber_delivery_suppressions
  for select to authenticated using (app.is_org_member(organization_id));

drop policy if exists sps_suppressions_select_member on public.status_page_subscriber_suppressions;
create policy sps_suppressions_select_member on public.status_page_subscriber_suppressions
  for select to authenticated using (app.is_org_member(organization_id));

drop policy if exists sps_provider_events_select_member on public.status_page_subscriber_provider_events;
create policy sps_provider_events_select_member on public.status_page_subscriber_provider_events
  for select to authenticated using (organization_id is not null and app.is_org_member(organization_id));

drop policy if exists sps_import_jobs_select_member on public.status_page_subscriber_import_jobs;
create policy sps_import_jobs_select_member on public.status_page_subscriber_import_jobs
  for select to authenticated using (app.is_org_member(organization_id));

drop policy if exists sps_export_jobs_select_member on public.status_page_subscriber_export_jobs;
create policy sps_export_jobs_select_member on public.status_page_subscriber_export_jobs
  for select to authenticated using (app.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- PII / secret-bearing tables: NO authenticated read policy. Service role only,
-- gated by an explicit subscriber.read_sensitive check in the app:
--
--   status_page_subscriber_event_prefs           (linked to a subscriber)
--   status_page_subscriber_components             (linked to a subscriber)
--   status_page_subscriber_preference_tokens      (hashed tokens)
--   status_page_subscriber_consent_records        (request metadata)
--   status_page_subscriber_delivery_deduplication (internal)
--   status_page_subscribers                       (RLS enabled in Phase 8; no read policy)
--
-- RLS is enabled above so the default-deny takes effect; deliberately no policy.
-- ---------------------------------------------------------------------------
