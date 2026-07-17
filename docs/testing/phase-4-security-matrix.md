# Phase 4 security test matrix

Automated where practical. Go tests run with `go test -race ./...`.

## SSRF / destination (destination_test.go, executor_test.go)

| Case | Status |
| --- | --- |
| Loopback IPv4 / IPv6 | blocked, covered |
| Private IPv4 / IPv6 | blocked, covered |
| Link-local | blocked, covered |
| Metadata IP (169.254.169.254) | blocked + flagged, covered |
| IPv4-mapped IPv6 | unmapped then blocked, covered |
| Mixed/decimal/hex notation | normalized then classified |
| DNS resolving to private IP | blocked at dial (`fakeResolver`), covered |
| DNS changing public→private | blocked at dial (per-connection resolution) |
| Redirect to private IP | blocked, covered |
| Redirect to metadata endpoint | blocked, covered |
| Redirect to unsupported scheme | blocked, covered |
| Embedded credentials | rejected in URL validation |
| Blocked port | rejected by default policy, covered (`TestPolicyAllowsExtraPorts`) |

## Response / protocol

| Case | Status |
| --- | --- |
| Oversized response | `response_too_large`, covered |
| Slow response / slow headers | timeout classified |
| Redirect loop / limit | `redirect_limit`, covered |
| Invalid / expired TLS / hostname mismatch | classified, never trusted |

## Secrets and logs

| Case | Status |
| --- | --- |
| Secret log redaction | covered (telemetry tests) |
| URL query redaction | covered (`TestRedactURLNeverLeaksQuery`) |
| Envelope tamper detection | covered (crypto tests) |
| Unknown key version / malformed envelope | covered |
| TS↔Go envelope interop | covered (both directions) |

## Tenancy (supabase/tests/phase4_monitoring_rls.sql)

| Case | Status |
| --- | --- |
| Cross-tenant secret access denied | covered |
| Cross-tenant result access denied | covered |
| Secret payloads invisible | covered |
| Heartbeat tokens invisible after creation | covered |
| Authenticated writes denied | covered |

## Scheduler safety

| Case | Status |
| --- | --- |
| Duplicate lease execution safe | covered (idempotency) |
| Suspended org excluded | covered |

## Abuse

| Case | Status |
| --- | --- |
| Test execution rate-limited | implemented (server action) |
| Heartbeat-token guessing (enumeration) | mitigated (generic responses, hashed lookup) |
| Heartbeat-rate abuse | rate-limited by IP |

## Manual / infrastructure (documented, not automated here)

Decompression-bomb limits at the platform edge, container image scan, and egress
policy verification require the deployed environment. Track in
`docs/handoff/monitor-worker-transfer.md`.
