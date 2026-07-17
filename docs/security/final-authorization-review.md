# Final authorization review

**Date:** 2026-07-17  
**Owner:** security / engineering  
**Classification context:** Not Ready

Customer roles: owner/admin/member/viewer in `src/lib/auth/roles.ts`. Platform roles in `src/lib/platform/permissions.ts`. UI hiding is never the sole control.

Cross-tenant SQL harness: Phase 3/4. Billing deny-by-default for webhook inbox tables. Residual: LB-010 billing/platform SQL harness.

