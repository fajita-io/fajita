# Phase 4 load and capacity results

## Status: not yet measured on target infrastructure

Load and capacity testing against the deployed container platform requires
Docker and the production/staging worker environment, which were not available in
the authoring environment. No public scale claim is made.

## Intended plan

Run against the fixture service only (never third-party websites), at increasing
monitor counts:

- 100 monitors
- 1,000 monitors
- 5,000 monitors

Measure: lease throughput, queue lag, database load, worker CPU and memory,
execution concurrency, result-write throughput, duplicate rate, failure
recovery, scheduler fairness.

## Tunables that bound load

- `MONITOR_WORKER_CONCURRENCY` (default 16)
- `MONITOR_WORKER_LEASE_BATCH` (default 20)
- `MONITOR_WORKER_POLL_MS` (default 1000)
- `MONITOR_WORKER_LEASE_SECONDS` (default 60)

Start conservative and scale after measurement. The fixture service and executor
are designed to run these tests deterministically; see
`docs/performance/monitoring-engine-budget.md`.

## What has been demonstrated

Correctness and safety under the Go race detector (`go test -race ./...` passes)
and the SQL scheduler/idempotency tests. Sustained-capacity numbers are
explicitly deferred until measured on real infrastructure.
