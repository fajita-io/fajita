# Final RLS review

**Date:** 2026-07-17  
**Owner:** security / engineering  
**Classification context:** Not Ready

Automated inventory: `scripts/rls-inventory.ts` (must pass). Surviving public tables enable RLS. Intentional no-policy tables are service-role only (secrets, leases, webhook events, platform ops).

Customer-mutable audit/provider tables: denied by design.

