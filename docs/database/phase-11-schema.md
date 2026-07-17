# Phase 11 schema

Migrations: `20260725000000` (schema), `20260725000100` (engine RPCs),
`20260725000200` (RLS), `20260725000300` (RPC defaults),
`20260725000400` (report aggregates).

## Extended tables

- `organization_onboarding`: added `first_concern`, `responsibility_role`,
  milestone timestamps (`first_monitor_activated_at`,
  `first_real_check_at`, `alert_path_ready_at`, `status_page_ready_at`,
  `activated_at`), and `checklist_dismissed_at`.
- `billing_cancellation_records`: added `secondary_reason`,
  `missing_feature`, `follow_up_ok`.

## New tables

| Table | Purpose | Key constraints |
| --- | --- | --- |
| `organization_onboarding_steps` | Per-org, per-version step completion | unique (org, version, step_key); status pending/completed/skipped; source user/system/reconciliation |
| `onboarding_events` | Append-only funnel source | bounded event_type and step_key |
| `user_onboarding` | Per-user tour and replay state | pk user_id; bounded tours jsonb |
| `lifecycle_states` | Current lifecycle state per org | pk organization_id; state check constraint; reasons jsonb |
| `lifecycle_events` | Append-only state transitions | bounded event_type |
| `lifecycle_email_preferences` | Per-user optional message classes | pk user_id; five booleans |
| `lifecycle_suppressions` | Bounce/complaint/manual ledger | unique (user, reason) |
| `lifecycle_delivery_intents` | Lifecycle email queue | unique dedup_key; status check; lease columns; max_attempts |
| `lifecycle_delivery_attempts` | Append-only send attempts | result check; bounded safe_summary |
| `weekly_reports` | Immutable weekly snapshots | unique (org, period_start); data_completeness check |
| `organization_report_settings` | Report config per org | pk organization_id; week_start monday/sunday |
| `weekly_report_recipients` | Owner-managed recipients | unique (org, user) |
| `incident_recaps` | Immutable incident snapshots | unique incident_id; bounded root_cause |
| `incident_recap_revisions` | Versioned recap corrections | field check (root_cause) |
| `incident_follow_up_actions` | Lightweight follow-ups | status open/completed/dropped; bounded lengths |

## RPCs (service-role execute only)

- `create_lifecycle_intent`: dedup-safe intent creation.
- `lease_lifecycle_deliveries`: due-intent leasing with SKIP LOCKED.
- `record_lifecycle_attempt`: attempt recording, exponential backoff,
  dead-letter, suppression.
- `expire_stale_lifecycle_leases`: reclaims crashed-worker leases.
- `cancel_lifecycle_intents`: cancels pending intents with a reason.
- `reconcile_lifecycle_delivery`: dry-run/repair for stuck deliveries.
- `report_check_stats`: per-monitor check aggregates for a period,
  excluding manual tests.

All follow the repo pattern: `app.` schema implementation with a `public.`
wrapper, `security definer`, pinned `search_path`, revoked from public and
authenticated, granted to `service_role`.

## Design choices

- Structured columns for organization, user, step, version, status, and
  timestamps; jsonb only for bounded metadata, snapshots, and reasons.
- Snapshots (`weekly_reports.snapshot`, `incident_recaps.snapshot`) are
  immutable by convention and contain safe names and hostnames only.
- No secrets or full URLs in any Phase 11 table.
