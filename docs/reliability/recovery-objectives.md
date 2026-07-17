# recovery objectives

**Date:** 2026-07-17  
**Owner:** operations / engineering

| System | RTO target | RPO target | Tested | Gap |
| --- | --- | --- | --- | --- |
| Authenticated app | 4h | 1h | untested restore | LB-004 |
| Monitoring scheduler | 1h | 15m | partial worker drills | — |
| Alert delivery | 2h | 15m | unit only | LB-007 |
| Public status pages | 30m | 15m | architecture independence | LB-012 |
| Billing webhooks | 4h | near-zero (Stripe retry) | code idempotency | LB-006 |

Not published as contractual SLAs.

