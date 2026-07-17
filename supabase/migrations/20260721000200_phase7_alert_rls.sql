-- Phase 7: row-level security for alert channels, routing, and delivery.
--
-- Same model as every earlier phase: customers get SELECT-only access to their
-- own organization's rows for defense in depth; all writes go through the
-- service role after TypeScript authorization. Two categories get NO customer
-- read policy at all, so RLS denies every customer read:
--
--   * alert_channel_secrets          -> encrypted provider credentials
--   * alert_delivery_deduplication   -> engine-internal dedup ledger
--
-- Customers can therefore never read a secret, forge a delivery result, mutate
-- an attempt, alter dedup records, or attach a cross-organization channel.
-- Forward-only migration.

-- Helper: enable RLS + a member SELECT policy for an org-scoped table.
-- Written inline per table to match the explicit style used in prior phases.

-- ----- Channels & configuration -----
alter table public.alert_channels enable row level security;
create policy alert_channels_select_member on public.alert_channels
  for select to authenticated
  using (app.is_org_member(organization_id) and deleted_at is null);

alter table public.alert_channel_versions enable row level security;
create policy alert_channel_versions_select_member on public.alert_channel_versions
  for select to authenticated
  using (app.is_org_member(organization_id));

-- Secrets: RLS enabled, NO policy. Customers can never read credential payloads.
alter table public.alert_channel_secrets enable row level security;

-- Signing keys carry only the public key id + status (never the secret), so
-- org members may read them to display rotation state.
alter table public.alert_webhook_signing_keys enable row level security;
create policy alert_webhook_signing_keys_select_member on public.alert_webhook_signing_keys
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_email_recipients enable row level security;
create policy alert_email_recipients_select_member on public.alert_email_recipients
  for select to authenticated
  using (app.is_org_member(organization_id) and removed_at is null);

alter table public.alert_email_suppressions enable row level security;
create policy alert_email_suppressions_select_member on public.alert_email_suppressions
  for select to authenticated
  using (app.is_org_member(organization_id));

-- ----- Routing -----
alter table public.alert_routing_rules enable row level security;
create policy alert_routing_rules_select_member on public.alert_routing_rules
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_rule_channels enable row level security;
create policy alert_rule_channels_select_member on public.alert_rule_channels
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_rule_monitors enable row level security;
create policy alert_rule_monitors_select_member on public.alert_rule_monitors
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_rule_monitor_groups enable row level security;
create policy alert_rule_monitor_groups_select_member on public.alert_rule_monitor_groups
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_rule_tags enable row level security;
create policy alert_rule_tags_select_member on public.alert_rule_tags
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_rule_event_types enable row level security;
create policy alert_rule_event_types_select_member on public.alert_rule_event_types
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_rule_severities enable row level security;
create policy alert_rule_severities_select_member on public.alert_rule_severities
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_quiet_hours enable row level security;
create policy alert_quiet_hours_select_member on public.alert_quiet_hours
  for select to authenticated
  using (app.is_org_member(organization_id));

-- ----- Delivery -----
alter table public.alert_delivery_intents enable row level security;
create policy alert_delivery_intents_select_member on public.alert_delivery_intents
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_delivery_attempts enable row level security;
create policy alert_delivery_attempts_select_member on public.alert_delivery_attempts
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_delivery_dead_letters enable row level security;
create policy alert_delivery_dead_letters_select_member on public.alert_delivery_dead_letters
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_delivery_suppressions enable row level security;
create policy alert_delivery_suppressions_select_member on public.alert_delivery_suppressions
  for select to authenticated
  using (app.is_org_member(organization_id));

alter table public.alert_test_deliveries enable row level security;
create policy alert_test_deliveries_select_member on public.alert_test_deliveries
  for select to authenticated
  using (app.is_org_member(organization_id));

-- Dedup ledger: RLS enabled, NO policy. Engine-internal only.
alter table public.alert_delivery_deduplication enable row level security;
