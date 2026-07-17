# Production readiness scorecard

Launch gate for Fajita. Governed by `operations-and-observability.mdc` and audited at Gate 6 / Phase 18.

**Canonical runtime registry:** `src/lib/platform/readiness/`  
**Ops UI:** `/internal/readiness`, `/internal/launch`  
**Exported docs:** `docs/readiness/final-production-readiness.md`

**No line may be marked complete without evidence.**

**Phase 18 classification (2026-07-17): Not Ready**

---

## Categories

| Category | Status | Score | Evidence | Blocking issue | Owner | Verification method | Last reviewed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Authentication | Pass with condition | 7 | Clerk middleware; invitations tests; auth docs | Production smoke pending LB-008 | engineering | Clerk + protected routes | 2026-07-17 |
| Authorization | Pass with condition | 7 | roles.ts; platform permissions; server checks | — | engineering | Matrix vs server | 2026-07-17 |
| Tenant isolation | Pass with condition | 7 | phase3/4 RLS SQL; org scoping | LB-010 billing RLS harness | engineering | Cross-tenant SQL | 2026-07-17 |
| Secrets | Pass with condition | 7 | secret-scan script; env split | Rotation exercises staging | engineering | Scan + bundle | 2026-07-17 |
| Privacy | Pass with condition | 6 | final-data-map; legal drafts | Counsel LB-003 | privacy | Data-flow review | 2026-07-17 |
| Data retention | Pass with condition | 6 | retention docs + jobs | Prod verify smoke | privacy | Policy + jobs | 2026-07-17 |
| Export and deletion | Pass with condition | 6 | privacy export/deletion reviews | Provider propagation honesty | privacy | Fixture export/delete | 2026-07-17 |
| Billing | Blocked | 5 | webhook-processor idempotency + persistence | LB-002/005/006 | billing | Stripe e2e | 2026-07-17 |
| Entitlements | Blocked | 5 | org engine + snapshots | Enforcement off LB-002 | billing | Server gate | 2026-07-17 |
| Failed payments | Pass with condition | 6 | grace-period module + recovery UI | Live dunning unproven | billing | Failed invoice sim | 2026-07-17 |
| Lifecycle communication | Pass with condition | 6 | Resend paths; lifecycle workers | Deliverability matrix | operations | Send test | 2026-07-17 |
| Security communication | In progress | 4 | disclosure routes | APM LB-001 | security | Trigger test | 2026-07-17 |
| Background jobs | Pass with condition | 7 | workers + cron tokens | — | engineering | Register + retry | 2026-07-17 |
| Monitoring (APM) | Pass with condition | 7 | Sentry wired; DSN pending in Vercel | Set SENTRY_DSN | operations | Controlled error in Sentry | 2026-07-17 |
| Alerts (product) | Pass with condition | 7 | alert tests; providers | LB-007 prod alert tests | engineering | Delivery test | 2026-07-17 |
| Recovery | Blocked | 3 | DR plan + tabletops | LB-004 restore | operations | Restore exercise | 2026-07-17 |
| Feature flags | Pass with condition | 7 | platform flags + launch plan | — | operations | Flag toggle | 2026-07-17 |
| Support diagnostics | Pass with condition | 6 | Pamphlet + support ops | No live SLA | support | Redaction review | 2026-07-17 |
| Incident readiness | Pass with condition | 6 | IR plan + tabletops | Solo-founder AR-002 | operations | Tabletop | 2026-07-17 |
| Trust-claim accuracy | Pass with condition | 7 | claims registry; no fake certs | — | product | Claim audit | 2026-07-17 |

## Rules

- Blocker or critical open → launch blocked.
- Every Pass cites concrete evidence.
- Do not use a single percentage to hide critical failures.

## Status

Phase 18 Gate 6 audit recorded **Not Ready** on 2026-07-17. See `docs/readiness/go-live-approval.md`.
