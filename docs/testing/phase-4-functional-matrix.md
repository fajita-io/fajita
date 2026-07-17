# Phase 4 functional test matrix

Automated coverage for engine behavior. Go tests run with `go test -race ./...`
in `services/monitor-worker`; TypeScript with `vitest run`.

## HTTP (executor_test.go, httpcheck, testfixture)

| Case | Status |
| --- | --- |
| Successful GET | covered |
| Successful HEAD | covered |
| Approved POST | covered |
| Expected status | covered |
| Unexpected status | covered |
| Slow response / timeout | covered (`TestExecuteRetriesTransientFailure`) |
| Redirect (validated) | covered |
| Redirect limit | covered |
| Large response (`response_too_large`) | covered |

## Assertions (assertions_test.go)

| Case | Status |
| --- | --- |
| Keyword found / missing / forbidden | covered |
| Valid / invalid JSON | covered |
| JSON path exists / equals / numeric compare | covered |
| Response-time threshold | covered |
| Header assertion | covered |
| Bounded/sanitized summaries | covered |

## TLS (tlscheck, executor_test.go)

| Case | Status |
| --- | --- |
| Valid certificate | covered |
| Expired / hostname mismatch / untrusted chain | classified (`tls_expired`, `tls_hostname_mismatch`, `tls_failure`) |
| Handshake timeout | classified |

## Scheduler (supabase/tests/phase4_scheduler.sql)

| Case | Status |
| --- | --- |
| Due monitor leased | covered |
| Future monitor ignored | covered |
| Paused / deleted monitor ignored | covered (lease CTE filters) |
| Suspended organization ignored | covered (lease CTE filters) |
| Lease expiration / reclamation | covered |
| Duplicate execution tolerated (idempotency) | covered |
| Schedule advancement | covered |

## Worker

| Case | Status |
| --- | --- |
| Startup / invalid configuration | covered (`internal/config` validation, fail-loud) |
| Readiness / liveness | endpoints implemented (`internal/health`) |
| Graceful shutdown / draining | implemented (scheduler drain) |
| Secret decryption failure path | classified `invalid_config` and finalized |
| Panic recovery per execution | covered (`TestExecutePanicRecovery`) |

## Heartbeats

| Case | Status |
| --- | --- |
| Valid / invalid / revoked token | implemented (`ingestHeartbeat`, route) |
| Duplicate event idempotency | implemented |
| Rate limit | implemented (IP-keyed) |
| Token rotation | implemented |

## TypeScript

`tests/monitor-secret-crypto.test.ts` (10 cases) plus the full app suite: 112
tests across 18 files pass.

## Not automatable in this environment

Container image build/scan and staging deployment require Docker and the
container platform (unavailable in the authoring environment). See
`docs/handoff/phase-4-handoff.md` Known limitations.
