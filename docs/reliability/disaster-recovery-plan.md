# disaster recovery plan

**Date:** 2026-07-17  
**Owner:** operations / engineering

Scenarios: DB loss/corruption, web/worker deploy failure, region loss, credential compromise, webhook loss, alert-provider outage, DNS/custom-domain failure, Pamphlet outage, repo compromise, admin account compromise.

Each: detect → authority → contain → impact → restore → reconcile → communicate → verify → return → follow-up.

RPO/RTO targets in recovery-objectives.md (targets, not contractual promises).

