# Phase 4 row-level security

Migration `supabase/migrations/20260718000100_phase4_monitoring_rls.sql`.
Automated tests in `supabase/tests/phase4_monitoring_rls.sql`.

## Principle

RLS is enabled on all 15 monitoring tables. Customer-facing tables allow
`SELECT` only, scoped to the caller's active organization. Sensitive tables have
no customer `SELECT` policy and are effectively invisible. Writes to monitoring
data are performed by trusted server code (service client, always scoped by
`organization_id`) and by the worker's restricted `app.*` functions, never by
customer sessions.

## Customer read access (SELECT, own org only)

- `monitors`, `monitor_versions`, `monitor_assertions`
- `check_schedules`, `check_executions`, `check_results`,
  `check_assertion_results`
- `monitor_security_events` (own org), `heartbeat_events` (own org)

Scoping uses active organization membership, consistent with Phase 3 tenancy.

## No customer access (invisible)

- `monitor_secrets` (no `SELECT` policy; encrypted payloads never reach a client)
- `heartbeat_tokens` (hashes only; raw token shown once at creation, never read
  back)
- `monitor_leases`, `monitor_workers`, `monitor_worker_heartbeats`,
  `monitor_regions`

## Enforced invariants (tested)

- Users access monitors only through active organization membership.
- Users cannot read another organization's monitors, results, or security
  events.
- Users cannot read encrypted secret payloads or heartbeat tokens.
- Users cannot alter worker records, execution results, or schedules directly
  (no customer write policies).
- Users cannot forge successful results.
- Suspended organizations are excluded from scheduling (enforced in
  `app.lease_due_checks`).

## Worker access

The worker does not use RLS-scoped table access. It authenticates as
`fajita_monitor_worker` with `EXECUTE`-only on the `app.*` `SECURITY DEFINER`
functions and no direct table privileges. See
`docs/security/worker-authentication.md`.

## Tests

`phase4_monitoring_rls.sql` seeds two users/orgs, creates monitors, secrets, and
results for one org, then asserts each user sees only its own org, sensitive
tables are inaccessible, and authenticated writes are denied. Run under the
Supabase test harness (transactional, rolls back).
