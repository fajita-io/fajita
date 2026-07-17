# Phase 6 state-machine test matrix

Automated coverage of the pure evaluator lives in
`tests/incidents-state-machine.test.ts` and `tests/incidents-duration.test.ts`
(run via `npm test`). The evaluator mirrors the SQL runtime; the incident lab
(`/internal/incident-lab`) demonstrates the same scenarios interactively.

## Transitions covered

operational→verifying, verifying→operational, verifying→degraded,
verifying→down, degraded→recovering, degraded→down, degraded→operational,
down→recovering, recovering→operational, recovering→degraded, recovering→down,
any eligible state→maintenance, maintenance→operational, maintenance→verifying.
Invalid transitions are rejected by `isValidTransition` and fail safely without
producing outbox events or projection changes.

## Automatic-incident cases

One failure does not open; confirmation threshold opens; success before threshold
clears; duplicate execution does not double-count (idempotency guard);
config failure ignored; platform failure → unknown (no customer incident);
TLS expiry → down; response-time/assertion on 2xx → degraded; heartbeat missed →
down; maintenance suppresses opening; critical monitor confirms one step sooner.

## Recovery cases

One success enters recovering; required successes resolve; failure during
recovery returns to down and continues the same incident; duplicate success does
not double-count; flapping raises the recovery threshold.

## Reopen cases

Failure inside the reopen window continues/reopens the existing incident; failure
outside the window opens a new incident.

## Coverage gaps (deferred)

SQL-level tests (pgTAP or equivalent) exercising `app.evaluate_check_result`
directly, concurrency tests using real parallel transactions, and the Go race
detector against the drain are recommended additions. See
`phase-6-concurrency-matrix.md` and the report Known limitations. The current
suite: 141 tests passing (`npm test`), including the Phase 6 additions.
