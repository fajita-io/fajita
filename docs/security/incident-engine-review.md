# Incident engine security review

Scope: Phase 6 incident and maintenance surfaces. Complements
`../database/phase-6-rls.md` and `incident-public-private-boundary.md`.

## Verified controls

| Requirement | Control |
| --- | --- |
| Customers cannot forge automatic incident events | No customer write policy; system events written only by `app.evaluate_check_result` via `service_role`/worker. |
| Customers cannot modify state-transition records | `incident_state_transitions` has no customer write policy. |
| Customers cannot write outbox delivery state | `incident_delivery_outbox`: no customer read or write. |
| Customers cannot publish public projections | `incident_public_projections`: no customer read or write; no public route. |
| Cross-tenant monitor attach blocked | `public.incident_attach_monitor` scopes monitor to the incident's org. |
| Cross-tenant assignment blocked | `public.incident_assign` validates the assignee is an active org member. |
| Internal notes stay private | Org-scoped RLS plus permission gate in the data layer; excluded from projection and outbox payloads. |
| Evidence is tenant-scoped and immutable | `incident_evidence` references check executions; no customer write. |
| Timeline content sanitized | Updates/notes stored as plain text / safe subset; no arbitrary HTML or scripts rendered. |
| Manual creation and maintenance rate limited | `limitOrThrow` in the server actions. |
| Concurrent opening deduplicated | `incidents_active_dedup_idx` + row locks. |
| Replay and reconciliation restricted | `public.replay_check_evaluation` and `public.reconcile_incident_state` granted to `service_role`; server guards require platform admin. |
| No secret URLs in titles | `app.default_incident_title` uses safe monitor names, never raw URLs or query strings. |
| No response bodies in summaries | Automatic summaries use classification and safe fields only. |
| No worker internals in customer UI | Platform uncertainty renders as `unknown`, not a worker error. |

## Authorization model

Permissions are centralized (`src/lib/auth/roles.ts`): `incidents:manage` and
`maintenance:manage`. Server actions enforce permission and feature availability
before calling any wrapper. UI hiding is never the authorization boundary.

## Content-injection posture

Update and note bodies are treated as plain text / a safe markdown subset. No
arbitrary HTML is rendered. Automatic titles and summaries are generated from
enumerated categories and safe monitor metadata.

## Residual risks and follow-ups

- Automated accessibility and load testing are documented as targets; numbers
  are not yet measured (see `../performance/incident-engine-budget.md`).
- SQL-level RLS and concurrency tests are recommended additions to the CI suite
  (see `../testing/phase-6-state-machine-matrix.md`).
