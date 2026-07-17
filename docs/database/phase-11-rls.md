# Phase 11 RLS

Migration `20260725000200_phase11_rls.sql`. Every Phase 11 table has RLS
enabled. Writes go exclusively through the service role (server actions and
workers); customer policies are SELECT-only, matching the Phase 3 to 10
pattern.

| Table | Customer SELECT policy |
| --- | --- |
| `organization_onboarding_steps` | Org members |
| `onboarding_events` | None (internal funnel source) |
| `user_onboarding` | Own row only |
| `lifecycle_states` | Org admins |
| `lifecycle_events` | None (internal log) |
| `lifecycle_email_preferences` | Own row only |
| `lifecycle_suppressions` | None (internal ledger) |
| `lifecycle_delivery_intents` | Own intents only |
| `lifecycle_delivery_attempts` | Attempts on own intents |
| `weekly_reports` | Org members |
| `organization_report_settings` | Org members |
| `weekly_report_recipients` | Org members |
| `incident_recaps` | Org members |
| `incident_recap_revisions` | Org members |
| `incident_follow_up_actions` | Org members |

Notes:

- Delivery history is user-scoped, so one member cannot read another
  member's lifecycle email records through the API.
- Lifecycle state is admin-scoped because it is operational metadata, not a
  member-facing feature.
- Suppressions and events have no customer policy at all; the application
  surfaces safe summaries through server-side queries with explicit
  permission checks.
- Cancellation feedback lives on `billing_cancellation_records`, which keeps
  its Phase 10 billing-permission scoping.
