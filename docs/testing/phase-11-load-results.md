# Phase 11 load test results

**Status: not yet executed.** No load test has been run for Phase 11 and no
numbers are claimed. This file records the plan; results replace this
notice when a run happens.

## Planned scenarios

| Scenario | Scale |
| --- | --- |
| New-organization burst | 100, 1,000, 5,000 seeded organizations |
| First-monitor activation burst | Concurrent milestone syncs on shared orgs |
| Weekly report generation | Full batch over seeded orgs with a week of check aggregates |
| Incident recap burst | Batch over freshly resolved seeded incidents |
| Setup and cancellation reminder evaluation | Full rule pass |
| Report and delivery-history browsing | Paginated reads under load |
| Reconciliation run | Onboarding and delivery reconciliation at scale |

## Metrics to record

Onboarding event throughput, progress-update latency, report generation
throughput and per-org duration, database load, worker CPU and memory,
email queue lag, deduplication conflict rate, report query time,
reconciliation duration.

## Constraints

Fixture data only; email delivery stubbed or pointed at a sink domain. No
uncontrolled real email may be sent during load tests.
