# Phase 6 row-level security

Migration `20260720000200_phase6_incident_rls.sql`. RLS is enabled on every
Phase 6 table.

## Read (SELECT) for `authenticated`

Member-scoped SELECT policies (via `app.is_org_member(organization_id)`) exist on:
`monitor_operational_states`, `incidents`, `incident_monitors`,
`incident_events`, `incident_state_transitions`, `incident_evidence`,
`incident_updates`, `incident_notes`, `incident_acknowledgments`,
`incident_assignments`, `incident_suppressions`, `maintenance_windows`,
`maintenance_monitor_links`, `maintenance_occurrences`.

## No customer read at all

These tables have RLS enabled and no `authenticated`/`anon` SELECT policy, so
customers cannot read them directly:

- `incident_public_projections` — stays private until Phase 8 publishes it.
- `incident_delivery_outbox` — customers cannot read or forge delivery state.
- `monitor_state_evaluations` — internal queue.
- `incident_counters` — reference-code sequence.

## No customer writes anywhere

No Phase 6 table grants INSERT, UPDATE, or DELETE to `authenticated` or `anon`.
Every mutation flows through `service_role` via the `public.*` wrapper functions
(`20260720000300_phase6_incident_api.sql`), which run `SECURITY DEFINER` after
the Next.js server actions have verified authentication, organization
membership, permission, and feature availability. As a result:

- Customers cannot forge automatic system events or state transitions.
- Customers cannot write outbox delivery status or publish projections.
- Customers cannot modify evidence.
- Customers cannot alter operational state directly.

## Cross-tenant protection

Wrapper functions are organization-scoped: monitor attachment, assignment, and
maintenance links validate that referenced monitors and users belong to the same
organization as the incident. Internal notes are org-scoped at RLS and further
permission-gated at the data-access layer so members without the required
permission never load them.

## Worker role

`fajita_monitor_worker` has EXECUTE on `app.process_incident_evaluations`,
`app.detect_missed_heartbeats`, and the finalize/lease functions, and no direct
table privileges. The public wrappers are granted to `service_role` only.
