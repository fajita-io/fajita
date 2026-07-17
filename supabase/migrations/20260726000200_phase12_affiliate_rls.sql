-- Phase 12: row-level security for affiliate tables.
--
-- Same model as Phases 3/10: every write goes through server actions that
-- authorize in code and use the service-role connection (bypasses RLS). RLS is
-- defense-in-depth read isolation.
--
-- Two tiers of affiliate-facing reads:
--   1. An affiliate's OWN non-identity data (profile, codes, campaigns, links,
--      payout/tax status, statements, notifications, exports, terms). Readable
--      directly via app.owns_affiliate().
--   2. Anything that carries CUSTOMER identity or links to it (sessions,
--      attributions, conversions, commissions, ledger, clicks, fraud, refunds,
--      disputes) has RLS enabled with NO affiliate policy. It is reachable only
--      by the service role, and server actions project anonymized, safe fields.
--
-- Platform-admin operations use the service role behind requirePlatformAdmin().

alter table public.affiliate_programs enable row level security;
alter table public.affiliate_program_versions enable row level security;
alter table public.affiliate_applications enable row level security;
alter table public.affiliate_application_reviews enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_profiles enable row level security;
alter table public.affiliate_email_preferences enable row level security;
alter table public.affiliate_codes enable row level security;
alter table public.affiliate_campaigns enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.affiliate_sessions enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_attributions enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.affiliate_conversion_events enable row level security;
alter table public.affiliate_eligibility_windows enable row level security;
alter table public.affiliate_commissions enable row level security;
alter table public.affiliate_commission_adjustments enable row level security;
alter table public.affiliate_commission_ledger enable row level security;
alter table public.affiliate_refund_events enable row level security;
alter table public.affiliate_dispute_events enable row level security;
alter table public.affiliate_fraud_flags enable row level security;
alter table public.affiliate_fraud_reviews enable row level security;
alter table public.affiliate_payout_profiles enable row level security;
alter table public.affiliate_tax_profiles enable row level security;
alter table public.affiliate_payout_batches enable row level security;
alter table public.affiliate_payout_items enable row level security;
alter table public.affiliate_payout_statements enable row level security;
alter table public.affiliate_terms_acceptances enable row level security;
alter table public.affiliate_creatives enable row level security;
alter table public.affiliate_notifications enable row level security;
alter table public.affiliate_exports enable row level security;
alter table public.affiliate_webhook_events enable row level security;
alter table public.affiliate_reconciliation_runs enable row level security;
alter table public.affiliate_admin_actions enable row level security;

-- ---------------------------------------------------------------------------
-- Program + versions: readable by any authenticated user (terms are not secret;
-- publication as marketing is a separate gate). Writes are service-role only.
-- ---------------------------------------------------------------------------
drop policy if exists affiliate_programs_select on public.affiliate_programs;
create policy affiliate_programs_select on public.affiliate_programs
  for select to authenticated using (true);

drop policy if exists affiliate_program_versions_select on public.affiliate_program_versions;
create policy affiliate_program_versions_select on public.affiliate_program_versions
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Applications: an applicant reads only their own application. Reviews (which
-- contain internal notes) are never readable by the applicant.
-- ---------------------------------------------------------------------------
drop policy if exists affiliate_applications_select on public.affiliate_applications;
create policy affiliate_applications_select on public.affiliate_applications
  for select to authenticated
  using (applicant_user_id = app.current_profile_id());

-- ---------------------------------------------------------------------------
-- Affiliate identity + own non-identity data: owner-readable.
-- ---------------------------------------------------------------------------
drop policy if exists affiliates_select on public.affiliates;
create policy affiliates_select on public.affiliates
  for select to authenticated
  using (user_id = app.current_profile_id());

drop policy if exists affiliate_profiles_select on public.affiliate_profiles;
create policy affiliate_profiles_select on public.affiliate_profiles
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_email_preferences_select on public.affiliate_email_preferences;
create policy affiliate_email_preferences_select on public.affiliate_email_preferences
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_codes_select on public.affiliate_codes;
create policy affiliate_codes_select on public.affiliate_codes
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_campaigns_select on public.affiliate_campaigns;
create policy affiliate_campaigns_select on public.affiliate_campaigns
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_links_select on public.affiliate_links;
create policy affiliate_links_select on public.affiliate_links
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_payout_profiles_select on public.affiliate_payout_profiles;
create policy affiliate_payout_profiles_select on public.affiliate_payout_profiles
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_tax_profiles_select on public.affiliate_tax_profiles;
create policy affiliate_tax_profiles_select on public.affiliate_tax_profiles
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_payout_items_select on public.affiliate_payout_items;
create policy affiliate_payout_items_select on public.affiliate_payout_items
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_payout_statements_select on public.affiliate_payout_statements;
create policy affiliate_payout_statements_select on public.affiliate_payout_statements
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_terms_acceptances_select on public.affiliate_terms_acceptances;
create policy affiliate_terms_acceptances_select on public.affiliate_terms_acceptances
  for select to authenticated
  using (affiliate_id is not null and app.owns_affiliate(affiliate_id));

drop policy if exists affiliate_notifications_select on public.affiliate_notifications;
create policy affiliate_notifications_select on public.affiliate_notifications
  for select to authenticated
  using (app.owns_affiliate(affiliate_id) and channel = 'in_app');

drop policy if exists affiliate_exports_select on public.affiliate_exports;
create policy affiliate_exports_select on public.affiliate_exports
  for select to authenticated
  using (app.owns_affiliate(affiliate_id));

-- ---------------------------------------------------------------------------
-- Creatives: any authenticated affiliate may read active creatives.
-- ---------------------------------------------------------------------------
drop policy if exists affiliate_creatives_select on public.affiliate_creatives;
create policy affiliate_creatives_select on public.affiliate_creatives
  for select to authenticated
  using (status = 'active' and app.current_affiliate_id() is not null);

-- ---------------------------------------------------------------------------
-- No affiliate/customer policy (service-role only): these carry customer
-- identity or must remain internal. Server actions project safe fields.
--   affiliate_application_reviews, affiliate_sessions, affiliate_clicks,
--   affiliate_attributions, affiliate_conversions, affiliate_conversion_events,
--   affiliate_eligibility_windows, affiliate_commissions,
--   affiliate_commission_adjustments, affiliate_commission_ledger,
--   affiliate_refund_events, affiliate_dispute_events, affiliate_fraud_flags,
--   affiliate_fraud_reviews, affiliate_payout_batches, affiliate_webhook_events,
--   affiliate_reconciliation_runs, affiliate_admin_actions.
-- RLS is enabled above with no policy, so authenticated/anon read nothing.
-- ---------------------------------------------------------------------------
