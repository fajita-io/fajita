# Phase 6 database schema

Migrations:

- `20260720000000_phase6_incident_schema.sql` — tables and monitor columns.
- `20260720000100_phase6_incident_engine.sql` — `app` schema functions.
- `20260720000200_phase6_incident_rls.sql` — RLS policies.
- `20260720000300_phase6_incident_api.sql` — `public` wrappers for `service_role`.

## Monitor column additions (`public.monitors`)

`criticality`, `failure_confirmation_threshold`, `recovery_confirmation_threshold`,
`degraded_response_time_ms`, `incident_reopen_window_seconds`,
`incident_suppressed`.

## Tables

| Table | Purpose |
| --- | --- |
| `monitor_operational_states` | One derived operational-state row per monitor (state, counters, active incident, flapping, lock_version, last evaluated execution). |
| `monitor_state_evaluations` | Durable evaluation queue drained by the worker. |
| `incidents` | Incident records (see `incident-fields`). Partial unique dedup index on active incidents. |
| `incident_counters` | Per-org sequence for `INC-N` reference codes (via `app.assign_incident_reference`). |
| `incident_monitors` | Affected-monitor links with primary flag and per-monitor evidence. |
| `incident_events` | Immutable timeline (auto-incrementing sequence per incident). |
| `incident_state_transitions` | Audit of operational-state changes. |
| `incident_evidence` | References to `check_executions` (no duplicated payloads). |
| `incident_updates` | Operator updates (internal or public-ready). |
| `incident_notes` | Private internal notes. |
| `incident_acknowledgments` | Acknowledgment history. |
| `incident_assignments` | Assignment history. |
| `incident_public_projections` | Public-safe projection (Phase 8; inactive). |
| `incident_delivery_outbox` | Transactional outbox (Phase 7; pending/suppressed). |
| `incident_suppressions` | Recorded suppressed evaluation outcomes. |
| `maintenance_windows` | Maintenance definitions (name, timezone, suppression policy, visibility). |
| `maintenance_monitor_links` | Monitors covered by a window. |
| `maintenance_occurrences` | Materialized occurrences (scheduled/active/completed/canceled). |

## Design rules

Structured columns for state, severity, timing, relationships, visibility,
acknowledgment, assignment, public status, delivery status, idempotency, and
correlation. Bounded JSON only for safe metadata. No response bodies, no request
headers, no secrets. Evidence references existing check results rather than
copying them, and survives later monitor configuration changes.

## Reference codes

`incidents` get a human reference `INC-N` per organization, assigned by the
`app.assign_incident_reference` trigger from `incident_counters`.
