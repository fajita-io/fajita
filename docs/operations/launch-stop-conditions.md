# launch stop conditions

**Date:** 2026-07-17  
**Owner:** operations

- **STOP-TENANT** (critical): Cross-tenant access confirmed
- **STOP-SECRET** (critical): Active secret exposure
- **STOP-SSRF** (critical): SSRF bypass to restricted network
- **STOP-BILL-DUP** (critical): Duplicate subscription or incorrect entitlement grant
- **STOP-WEBHOOK** (critical): Lost billing webhook events affecting customers
- **STOP-QUEUE** (critical): Monitoring scheduler backlog above threshold
- **STOP-ALERT** (critical): Alert delivery below threshold
- **STOP-STATUS** (critical): Public status-page outage
- **STOP-BACKUP** (critical): Database backup failure
- **STOP-ROLLBACK** (critical): Production rollback unavailable

On trigger: pause launch → disable flag → declare incident → runbook → communicate → reconcile → reapprove.

