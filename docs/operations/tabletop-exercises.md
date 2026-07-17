# tabletop exercises

**Date:** 2026-07-17  
**Owner:** operations

## Exercises recorded 2026-07-17 (tabletop)

### A: Cross-tenant exposure suspicion
Immediate restrict → preserve evidence → scope → comms decision → rotate → audit. Gap: APM paging (LB-001).

### B: Scheduler backlog
Detect lag → scale/drain workers → customer impact → status decision. Gap: live lag dashboards depend on ops metrics availability.

### C: Stripe webhook outage
Backlog → entitlement safety (no grant on success URL alone) → reconcile. Gap: live payment test (LB-006).

### D: Provider credential compromise
Revoke → rotate → continuity → audit.

### E: Database restoration
Decision → restore → RPO/RTO. Gap: LB-004 evidence.

