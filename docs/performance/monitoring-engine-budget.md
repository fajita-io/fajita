# Monitoring engine performance budget

Phase 4. Targets and the controls that keep the engine within them.

## Worker targets

| Concern | Target / control |
| --- | --- |
| Idle memory | Low; no unbounded buffers |
| Goroutines | Bounded by a fixed worker pool (`MONITOR_WORKER_CONCURRENCY`, default 16) |
| Concurrent checks | Bounded by the pool; configurable |
| Response reads | Bounded by `body_size_limit_bytes`; no unbounded reads |
| Queue polling | Interval-based (`MONITOR_WORKER_POLL_MS`, default 1000ms); no busy loop |
| Database queries | Batched leasing (`MONITOR_WORKER_LEASE_BATCH`, default 20); pooled connections (pgxpool) |
| Locking | `FOR UPDATE SKIP LOCKED`; no global lock around all checks |
| Fairness | Priority + `next_check_at` ordering; no single-customer starvation |
| Backpressure | Lease batch size and concurrency cap admission |

## Application targets

- Internal views paginate results (lab lists capped, e.g. 100 monitors / 25
  events)
- Result queries use indexes on organization and schedule fields
- No huge result payloads; no full response bodies returned
- No excessive polling; worker-health reads are bounded
- Heartbeat route is lightweight and rate-limited

## Time units

All durations use explicit `_ms` fields. Units are never mixed within a field.

## Measurement status

Concurrency, batch size, and poll interval are tunable via environment. Realistic
sustained capacity must be measured on the deployed container platform against
the fixture service before publishing any capacity claim. Synthetic local numbers
are not a public claim. See `docs/testing/phase-4-load-results.md`.
