# Phase 11 test matrix

Status legend: **Automated** (unit test in the repo), **Structural**
(enforced by database constraints or code structure), **Manual/staging**
(requires a running environment; not yet executed), **Deferred** (planned,
not implemented this phase).

## Automated (passing, `npm test`)

- Report period math: Monday/Sunday week starts, organization timezone,
  DST-correct midnights, exact labels, cross-year labels, seven-day
  invariance, UTC fallback (`src/lib/reports/weekly.test.ts`).
- Dedup keys: determinism, scope separation per message, stage separation,
  cross-type collision freedom, length bound
  (`src/lib/lifecycle/messages.test.ts`).
- Registry integrity: every message classed, optional classes have
  preferences, required classes do not, template versions positive.
- Timing bounds: setup reminders capped at 24h/72h, recap noise floor,
  pre-deletion ordering.
- Template rendering: every registered message renders from its fixture
  with subject, preview, HTML, and plain text; no leaked placeholders, no
  em dashes, no scripts or forms; hostile content escapes; unknown version
  falls back to current; preference footer only on optional classes
  (`src/lib/lifecycle/emails/templates.test.ts`).
- Onboarding definitions: unique ordered steps, core/optional split,
  destinations, tour step caps, deterministic monitor recommendations, no
  em dashes (`src/lib/onboarding/definitions.test.ts`).

## Structural guarantees

- Duplicate lifecycle email: unique `dedup_key` column.
- Duplicate step completion: unique `(org, version, step_key)`.
- Duplicate weekly report: unique `(org, period_start)`.
- Duplicate recap: unique `incident_id`.
- Concurrent milestone writes: null-guarded updates.
- Concurrent workers: `FOR UPDATE SKIP LOCKED` leasing.
- Send-time eligibility: preference, membership, and suppression re-checked
  in the worker, covering removal or preference change mid-flight.
- Cross-tenant access: RLS per `docs/database/phase-11-rls.md`.

## Manual/staging (not yet executed)

Functional matrices from the phase specification for onboarding flows,
lifecycle email end-to-end (with a real Resend key), weekly report weeks,
incident recap scenarios, and cancellation/reactivation journeys; RLS
integration tests against a live database; accessibility passes (screen
readers, 200% zoom, reduced motion); responsive checks at the seven
breakpoints; dark-mode and images-disabled email review. These require a
staging environment with the worker scheduled and a verified sender.

## Deferred

Automated end-to-end suites (Playwright) and load tests (see
`phase-11-load-results.md`).
