# Incident state machine

Evaluation version: 1. Canonical transition table:
`src/lib/incidents/state-machine.ts` (`ALLOWED_TRANSITIONS`), mirrored by the SQL
runtime `app.evaluate_check_result`.

## Monitor operational states

- `operational` — passing.
- `verifying_failure` — an eligible failure is seen but the confirmation
  threshold is not yet met.
- `degraded` — responding but failing a non-critical requirement.
- `down` — unreachable or failing a critical requirement.
- `recovering` — success seen during an active incident, not yet confirmed.
- `maintenance` — suppressed by an active maintenance window.
- `unknown` — platform uncertainty (Fajita's own failure), never a customer
  outage.

## Incident lifecycle states

- `open` — active incident.
- `monitoring` — reserved for the public-update workflow; operational state is
  tracked separately.
- `resolved` — recovery confirmed or manually resolved.
- `canceled` — opened in error; preserved, never deleted.

## Allowed operational transitions

```
operational        -> verifying_failure, maintenance, unknown
verifying_failure  -> operational, degraded, down, maintenance, unknown
degraded           -> recovering, down, operational, maintenance, unknown
down               -> recovering, degraded, maintenance, unknown
recovering         -> operational, degraded, down, maintenance, unknown
maintenance        -> operational, verifying_failure, degraded, down, unknown
unknown            -> operational, verifying_failure, degraded, down, maintenance
```

`isValidTransition(from, to)` returns true for equal states (idempotent
re-evaluation) and any pair in the table above. Anything else is rejected and
must not corrupt state, create outbox events, or alter the projection.

## Confirmation defaults

- Failure threshold: 2 eligible failures (critical monitors: effectively 1 via a
  documented reduction, floored at 1).
- Recovery threshold: 2 consecutive eligible successes (raised by 2 while
  flapping).
- Reopen window: 600 seconds. A confirmed failure inside the window continues or
  reopens the existing incident; outside it, a new incident opens.

## Degraded vs down

`operationalFromFailure(category, httpStatus)` returns `degraded` only when the
endpoint answered (HTTP 200–399) and the failure is a non-critical assertion,
invalid JSON, or response-time breach. Everything else (unreachable, TLS,
5xx, missed heartbeat) is `down`. See `recovery-confirmation.md` and
`flapping-detection.md` for the recovery and churn rules.

## Severity

`incidentSeverity(criticality, operational, affectedCount)`:

- 4+ affected monitors: `critical`.
- `down` + critical monitor: `critical`; `down` otherwise: `major`.
- `degraded` + high/critical monitor: `major`; otherwise: `minor`.

Severity is a starting point. Authorized operators can override it; every change
writes a timeline event and an audit event. Fajita makes no automatic
business-impact claim.

## Test coverage

The transition table, classification, confirmation, recovery, reopen, and
flapping rules are unit tested in `tests/incidents-state-machine.test.ts`. The
internal incident lab (`/internal/incident-lab`) runs the same evaluator over
labeled synthetic scenarios.
