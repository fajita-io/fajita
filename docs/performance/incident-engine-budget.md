# Incident engine performance budget

Targets for the incident engine. Measurements are pending; this document sets the
budget and records how it is enforced structurally. Do not present these as
measured results or make public real-time claims.

## Design guarantees (structural, in place)

- Evaluation is decoupled from check execution: `app.finalize_check` only
  enqueues; the worker drains asynchronously. Check latency is unaffected.
- Active-incident and operational-state lookups are indexed
  (`incidents_active_dedup_idx`, primary key on `monitor_operational_states`).
- Timeline is paginated; evidence loading is bounded per query.
- No full result-history scan per evaluation: state is read from the single
  operational-state row.
- No per-incident N+1 monitor query in the list (affected counts are aggregated).
- Outbox writes are single-row, idempotent inserts inside the evaluation txn.
- Maintenance lookup is a bounded indexed query on active occurrences.

## Targets

| Metric | Target |
| --- | --- |
| Evaluation latency (per result) | < 50 ms p95 |
| Incident-open latency (enqueue to open) | < 2 × drain interval |
| Recovery-resolution latency | bounded by recovery threshold × check interval |
| Active-incident dashboard query | < 200 ms p95 |
| Timeline load (page of 50) | < 200 ms p95 |
| Maintenance lookup | < 20 ms p95 |
| Queue lag under 10% burst | drains within a few ticks |

## Load scenarios to run

100 / 1,000 / 5,000 monitors; burst failures across 10%; burst recovery;
long-running timelines; wide active maintenance; flapping monitors; concurrent
dashboard use. Use controlled fixtures only. Never generate load against
third-party websites. Record results in `../testing/phase-6-load-results.md`.

## Status

Structural budget enforced. Empirical measurement deferred; see report Known
limitations.
