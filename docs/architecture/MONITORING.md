# Monitoring execution

Fajita's monitor lifecycle is its core technical identity. Verification before escalation is what separates Fajita from simple ping monitors.

## Scheduling

1. Each monitor has a `check_schedules` row with `next_run_at`.
2. The Go worker polls and calls `app.lease_due_checks()` to claim work atomically.
3. Leased checks run concurrently up to worker capacity.
4. After execution, `app.finalize_check()` stores results and advances the schedule.

Self-hosted installs use the always-on Go worker loop. A scheduler sidecar or external cron can also hit `/api/cron/monitor-tick` as a safety net.

## Check types

| Type | What runs |
| --- | --- |
| Website / API | HTTP(S) request with status, latency, optional assertions |
| SSL | TLS handshake and certificate expiry inspection |
| Heartbeat | Expects inbound pings; worker detects missed pulses |

## Assertions

Monitors can assert on:

- HTTP status codes
- Response time thresholds
- Response body content (including JSON paths where configured)

Failed assertions count as check failures and enter the same verification path.

## Failure detection

A check failure includes:

- Connection errors
- Timeouts
- Unexpected status codes
- Assertion failures
- SSL expiry or handshake failures
- Missed heartbeat windows

Not every failure opens an incident immediately.

## Verification

When verification is enabled for a monitor or organization policy:

1. The first failure marks the monitor as degraded and queues verification.
2. The worker runs additional checks from the local fleet.
3. Consecutive failures must meet the configured threshold before confirmation.
4. Transient failures that recover during verification do not open incidents.

Self-hosted verification uses the operator's worker fleet. Multi-region confirmation is not simulated on a single node unless you deploy workers in distinct regions with separate `MONITOR_WORKER_REGION` values.

## Incident opening

Confirmed failures:

1. Open or update an incident linked to the monitor
2. Project public status page state when configured
3. Enqueue notifications according to alert channel rules

## Recovery

When checks return healthy:

1. Verification may require consecutive healthy results before closing
2. Incidents move to resolved with timeline entries
3. Recovery notifications fire when configured

## Retries and idempotency

- Check finalization is idempotent per lease token
- Alert outbox uses deduplication keys to prevent duplicate sends on retry
- Cron and worker paths can both advance scheduler state; leasing prevents double execution

## SSRF protections

Outbound monitor checks and webhook delivery validate targets at connection time. Private networks, loopback, and cloud metadata endpoints are blocked by default. Self-hosters can enable private network monitoring with `FAJITA_ALLOW_PRIVATE_NETWORKS=true` after reviewing security implications.

## Related docs

- [Architecture overview](./OVERVIEW.md)
- [Self-hosted architecture](../self-hosting/ARCHITECTURE.md)
- [Troubleshooting](../self-hosting/TROUBLESHOOTING.md)
