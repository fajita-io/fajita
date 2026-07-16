# Production readiness scorecard

Launch gate for Fajita. Governed by `operations-and-observability.mdc` and audited by `production-readiness-auditor` at Gate 6. Complements `.cursor/experience-memory/release-scorecard.md` (visual/experience) with operational readiness.

**No line may be marked complete without evidence.** Score 1 to 10. A launch cannot pass with any unresolved blocker or critical issue.

**Status:** Not started · In progress · Pass · Blocked
**Legend:** Evidence = file/config/test/interface proving it, not a claim. A blank cell shown as `n/a` means not yet assigned.

---

## Categories

| Category | Status | Score | Evidence | Blocking issue | Owner | Verification method | Last reviewed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Authentication | Not started | n/a | Clerk configured, not wired | Auth not implemented | `[UNRESOLVED]` | Inspect Clerk integration + protected routes | 2026-07-16 |
| Authorization | Not started | n/a | n/a | No server-side authz yet | `[UNRESOLVED]` | Inspect ownership checks + denials | 2026-07-16 |
| Tenant isolation | Not started | n/a | n/a | No workspace model; RLS policies absent | `[UNRESOLVED]` | RLS + cross-tenant test | 2026-07-16 |
| Secrets | In progress | n/a | Env split public/server (`.env.example`) | Verify no server key in client bundle | `[UNRESOLVED]` | Bundle inspection | 2026-07-16 |
| Privacy | Not started | n/a | `data-inventory.md` baseline | Retention/processors not finalized | `[UNRESOLVED]` | Data-flow review | 2026-07-16 |
| Data retention | Not started | n/a | n/a | Windows `[UNRESOLVED]` | `[UNRESOLVED]` | Policy + code review | 2026-07-16 |
| Export and deletion | Not started | n/a | Billing cascade in migration | No export/deletion feature | `[UNRESOLVED]` | Deletion cascade test | 2026-07-16 |
| Billing | In progress | n/a | `src/lib/stripe/*`, checkout/portal routes | Webhook does not persist state | `[UNRESOLVED]` | Stripe test-mode e2e | 2026-07-16 |
| Entitlements | In progress | n/a | `entitlements.ts` reads Stripe | Only monitor count defined | `[UNRESOLVED]` | Server gate test | 2026-07-16 |
| Failed payments | Not started | n/a | n/a | No dunning; grace undefined | `[UNRESOLVED]` | Failed-invoice simulation | 2026-07-16 |
| Lifecycle communication | Not started | n/a | `communication-map.md` baseline | No provider wired | `[UNRESOLVED]` | Send test + template review | 2026-07-16 |
| Security communication | Not started | n/a | n/a | Depends on Clerk/email | `[UNRESOLVED]` | Trigger test | 2026-07-16 |
| Background jobs | Not started | n/a | Stripe webhook only | No runner; no idempotency | `[UNRESOLVED]` | Register + retry test | 2026-07-16 |
| Monitoring | Not started | n/a | DataFast (analytics only) | No error monitor | `[UNRESOLVED]` | Error-capture verification | 2026-07-16 |
| Alerts | Not started | n/a | n/a | No thresholds/ownership | `[UNRESOLVED]` | Alert-fire test | 2026-07-16 |
| Recovery | Not started | n/a | n/a | No failed-job recovery | `[UNRESOLVED]` | Replay test | 2026-07-16 |
| Feature flags | Not started | n/a | n/a | None configured | `[UNRESOLVED]` | Flag toggle test | 2026-07-16 |
| Support diagnostics | Not started | n/a | n/a | No support view | `[UNRESOLVED]` | Redaction review | 2026-07-16 |
| Incident readiness | Not started | n/a | `incident-playbook.md` baseline | No on-call/ownership | `[UNRESOLVED]` | Tabletop drill | 2026-07-16 |
| Trust-claim accuracy | In progress | n/a | `trust-evidence-register.md` | Claims unverified until shipped | `[UNRESOLVED]` | Claim-vs-reality audit | 2026-07-16 |

## Rules

- Blocker or critical open -> launch blocked.
- Every Pass cites concrete evidence.
- Re-audit in fresh context at Gate 6 (`production-readiness-auditor`) plus the security, billing, and operations architects.

## Status

Installation baseline recorded 2026-07-16. Nothing is launch-ready; this scorecard tracks progress toward it. No score assigned until each category has inspected evidence.
