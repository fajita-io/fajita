# capacity model

**Date:** 2026-07-17  
**Owner:** operations / engineering

Launch model uses measured prior-phase throughput, not fantasy growth.

| Horizon | Active orgs | Active monitors | Checks/day (order) | Notes |
| --- | --- | --- | --- | --- |
| Expected launch | tens | hundreds | low thousands | Stage 1 caps |
| 10× | hundreds | thousands | tens of thousands | Scale trigger: queue lag |
| 90-day | low thousands | tens of thousands | verify DB/worker CPU | Revisit indexes |

Ceiling: first bottleneck historically check-result write + worker concurrency. Stop conditions in launch control.

