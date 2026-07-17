# Launch-blocker register

**Date:** 2026-07-17  
**Owner:** operations  
**Open critical:** LB-003, LB-004, LB-005, LB-006, LB-008  
**Open high:** LB-007, LB-012

| ID | Title | Domain | Severity | Status | Owner | Target | Accepted |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LB-001 | No error-monitoring / APM vendor | operations | critical | verified | operations | 2026-07-24 | no |
| LB-002 | Billing enforcement disabled | billing | critical | accepted | billing | 2026-07-31 | yes |
| LB-003 | Legal counsel review incomplete | legal | critical | open | privacy | 2026-08-07 | no |
| LB-004 | Database restore exercise not evidenced | reliability | critical | open | operations | 2026-07-28 | no |
| LB-005 | Stripe live price amounts unresolved | billing | critical | open | billing | 2026-07-24 | no |
| LB-006 | Controlled live payment test not run | billing | critical | open | billing | 2026-07-31 | no |
| LB-007 | Production real alert tests not run | reliability | high | open | operations | 2026-07-28 | no |
| LB-008 | Production smoke test not run | launch | critical | mitigating | operations | 2026-07-28 | no |
| LB-009 | Stripe webhook e2e signature suite incomplete | billing | high | verified | engineering | 2026-07-24 | no |
| LB-010 | Billing/platform RLS SQL harness incomplete | security | medium | open | engineering | 2026-08-14 | no |
| LB-011 | Dependency audit CI gate not enforced | security | high | verified | engineering | 2026-07-24 | no |
| LB-012 | Official Fajita status page production config incomplete | launch | high | mitigating | operations | 2026-07-28 | no |

## Detail

### LB-001: No error-monitoring / APM vendor

- **Domain:** operations
- **Severity:** critical
- **Status:** verified
- **Description:** Production errors are not captured by a dedicated error monitor. DataFast provides product analytics only.
- **Customer impact:** Silent failures may go undetected until customers report them.
- **Business impact:** Cannot meet operational incident detection expectations for public launch.
- **Security impact:** Security-relevant exceptions may not page an operator.
- **Reproduction:** Inspect package.json and observability-plan.md; no Sentry/equivalent wired.
- **Evidence:** .cursor/maturity-memory/observability-plan.md; package.json dependencies
- **Owner:** operations
- **Target date:** 2026-07-24
- **Mitigation:** Sentry selected and wired (@sentry/nextjs). Set SENTRY_DSN + NEXT_PUBLIC_SENTRY_DSN in Vercel.
- **Verification test:** Throw a controlled staging error and confirm capture in Sentry.
- **Accepted risk:** no
- **Approval:** phase-18-close
- **Closed date:** 2026-07-17

### LB-002: Billing enforcement disabled

- **Domain:** billing
- **Severity:** critical
- **Status:** accepted
- **Description:** BILLING_ENFORCEMENT_ENABLED defaults false via env. Unbilled orgs receive beta entitlements until enabled.
- **Customer impact:** Paid limits are not enforced; plan promises may not match access.
- **Business impact:** Revenue leakage and incorrect entitlement grants if public paid launch proceeds with flag off.
- **Security impact:** Low direct security impact; high integrity impact.
- **Reproduction:** Read src/lib/billing/enforcement.ts; unset BILLING_ENFORCEMENT_ENABLED
- **Evidence:** src/lib/billing/enforcement.ts; enforcement.test.ts; .env.example
- **Owner:** billing
- **Target date:** 2026-07-31
- **Mitigation:** Env-gated. Keep off for Stage 0. Set BILLING_ENFORCEMENT_ENABLED=true only after stripe:verify-prices + real-payment-test.
- **Verification test:** With flag on, free org denied paid monitor limit; paid org allowed.
- **Accepted risk:** yes
- **Approval:** founder Stage-0 scope only (not Stage 2)
- **Closed date:** 2026-07-17

### LB-003: Legal counsel review incomplete

- **Domain:** legal
- **Severity:** critical
- **Status:** open
- **Description:** Public legal drafts exist. Counsel has not approved Terms, Privacy, AUP, DPA, or affiliate terms.
- **Customer impact:** Customers may rely on unreviewed legal language.
- **Business impact:** Launch liability and contract risk.
- **Security impact:** Indirect; privacy disclosures may diverge from behavior until counsel pass.
- **Reproduction:** docs/legal/final-counsel-review-package.md status field
- **Evidence:** docs/legal/final-counsel-review-package.md; src/lib/legal/* drafts
- **Owner:** privacy
- **Target date:** 2026-08-07
- **Mitigation:** Publish only with explicit Draft / Counsel review required labeling until approval.
- **Verification test:** Counsel approval recorded with date and document versions.
- **Accepted risk:** no
- **Approval:** —
- **Closed date:** —

### LB-004: Database restore exercise not evidenced

- **Domain:** reliability
- **Severity:** critical
- **Status:** open
- **Description:** Backups may be configured at the provider, but a full staging restore with evidence has not been completed.
- **Customer impact:** Data-loss recovery time unknown.
- **Business impact:** Cannot assert RTO/RPO with evidence.
- **Security impact:** Restore environment handling of secrets unverified.
- **Reproduction:** docs/reliability/database-restore-exercise.md result = not completed
- **Evidence:** docs/reliability/database-restore-exercise.md
- **Owner:** operations
- **Target date:** 2026-07-28
- **Mitigation:** Run isolated staging restore per runbook before Stage 1.
- **Verification test:** Restore checklist items 1-16 complete with artifacts.
- **Accepted risk:** no
- **Approval:** —
- **Closed date:** —

### LB-005: Stripe live price amounts unresolved

- **Domain:** billing
- **Severity:** critical
- **Status:** open
- **Description:** Plan lookup keys exist; live Dashboard price amounts are not verified in evidence.
- **Customer impact:** Checkout may fail or show incorrect prices.
- **Business impact:** Cannot sell safely.
- **Security impact:** None direct.
- **Reproduction:** Stripe Dashboard vs src/lib/stripe/plans.ts lookup keys
- **Evidence:** maturity billing rules; plans.ts
- **Owner:** billing
- **Target date:** 2026-07-24
- **Mitigation:** Catalog amounts are SoT (starter $9 / pro $19 / business $39 monthly). Seed+verify scripts align. Fajita Stripe keys were not in .env.local; MCP Stripe account is Learn Domains (do not seed there).
- **Verification test:** npm run stripe:verify-prices against the Fajita Stripe account.
- **Accepted risk:** no
- **Approval:** —
- **Closed date:** —

### LB-006: Controlled live payment test not run

- **Domain:** billing
- **Severity:** critical
- **Status:** open
- **Description:** No evidenced live Checkout → webhook → entitlement → cancel/refund fixture run.
- **Customer impact:** First real customers may hit broken billing.
- **Business impact:** Revenue and trust risk.
- **Security impact:** Webhook livemode path unproven in production.
- **Reproduction:** docs/operations/real-payment-test.md unmarked
- **Evidence:** docs/operations/real-payment-test.md; STRIPE_SECRET_KEY absent from local env
- **Owner:** billing
- **Target date:** 2026-07-31
- **Mitigation:** Add Fajita Stripe keys, seed prices, execute Stage 0 live payment fixture with cleanup.
- **Verification test:** Checklist complete; fixture annotated and excluded from revenue metrics.
- **Accepted risk:** no
- **Approval:** —
- **Closed date:** —

### LB-007: Production real alert tests not run

- **Domain:** reliability
- **Severity:** high
- **Status:** open
- **Description:** Unit/integration alert tests pass; controlled production email/Slack/Discord/webhook tests pending.
- **Customer impact:** Customers may not receive incident alerts.
- **Business impact:** Core product promise at risk.
- **Security impact:** Webhook signing in prod path unverified end-to-end.
- **Reproduction:** docs/operations/real-alert-tests.md unmarked; RESEND_API_KEY absent locally
- **Evidence:** docs/operations/real-alert-tests.md; tests/alerts-*.test.ts
- **Owner:** operations
- **Target date:** 2026-07-28
- **Mitigation:** Run Stage 0 alert fixture deliveries to internal destinations only once Resend/Slack credentials exist.
- **Verification test:** All four channel types deliver once without duplicate spam.
- **Accepted risk:** no
- **Approval:** —
- **Closed date:** —

### LB-008: Production smoke test not run

- **Domain:** launch
- **Severity:** critical
- **Status:** mitigating
- **Description:** Full authenticated production smoke pending; public path smoke is automated.
- **Customer impact:** Unknown broken authenticated paths at launch.
- **Business impact:** Stage 0 authenticated verification incomplete.
- **Security impact:** Export/deletion/admin paths unverified in prod.
- **Reproduction:** docs/operations/production-smoke-test.md
- **Evidence:** scripts/public-smoke.ts; docs/operations/production-smoke-test.md
- **Owner:** operations
- **Target date:** 2026-07-28
- **Mitigation:** Public smoke script added. Run authenticated checklist after fixture org exists.
- **Verification test:** npm run smoke:public passes; authenticated checklist complete.
- **Accepted risk:** no
- **Approval:** —
- **Closed date:** —

### LB-009: Stripe webhook e2e signature suite incomplete

- **Domain:** billing
- **Severity:** high
- **Status:** verified
- **Description:** Idempotency and persistence are implemented; route-level signature/duplicate tests were missing.
- **Customer impact:** Low if Stripe signature verification holds; residual processing risk.
- **Business impact:** Harder to prove billing integrity under audit.
- **Security impact:** Forged webhook risk if verification regresses undetected.
- **Reproduction:** tests/stripe-webhook-route.test.ts
- **Evidence:** tests/stripe-webhook-route.test.ts; webhook-inbox.test.ts
- **Owner:** engineering
- **Target date:** 2026-07-24
- **Mitigation:** Route tests cover missing signature, bad signature, processed/duplicate 200, failed 500.
- **Verification test:** Invalid signature → 400; duplicate processed → 200 duplicate.
- **Accepted risk:** no
- **Approval:** phase-18-close
- **Closed date:** 2026-07-17

### LB-010: Billing/platform RLS SQL harness incomplete

- **Domain:** security
- **Severity:** medium
- **Status:** open
- **Description:** Phase 3/4 SQL RLS harnesses exist; Phase 10+ billing/platform lack analogous pgTAP-style suites.
- **Customer impact:** Low if app authz + deny-by-default hold; residual regression risk.
- **Business impact:** Slower confidence in schema changes.
- **Security impact:** Policy regressions may go unnoticed.
- **Reproduction:** supabase/tests lacks phase10 billing harness
- **Evidence:** supabase/tests/; docs/security/final-rls-review.md
- **Owner:** engineering
- **Target date:** 2026-08-14
- **Mitigation:** RLS inventory script + deny-by-default model; add SQL harness post-Stage 0.
- **Verification test:** Cross-tenant select denied for billing_webhook_events as authenticated.
- **Accepted risk:** no
- **Approval:** —
- **Closed date:** —

### LB-011: Dependency audit CI gate not enforced

- **Domain:** security
- **Severity:** high
- **Status:** verified
- **Description:** Manual dependency review documented; npm audit critical gate not yet a required status check.
- **Customer impact:** Supply-chain vulnerability risk.
- **Business impact:** Launch supply-chain residual risk.
- **Security impact:** Known CVEs may ship.
- **Reproduction:** .github workflows lack npm audit fail-on critical
- **Evidence:** docs/security/final-dependency-review.md; .github/
- **Owner:** engineering
- **Target date:** 2026-07-24
- **Mitigation:** CI workflow .github/workflows/ci.yml runs npm audit --omit=dev --audit-level=high.
- **Verification test:** CI fails on high/critical CVE; SBOM baseline in docs/security/sbom-status.md.
- **Accepted risk:** no
- **Approval:** phase-18-close
- **Closed date:** 2026-07-17

### LB-012: Official Fajita status page production config incomplete

- **Domain:** launch
- **Severity:** high
- **Status:** mitigating
- **Description:** Self-monitoring definitions and /api/health exist; production status page + DNS + monitors not live (zero status_pages rows).
- **Customer impact:** During outages, customers lack a trusted status surface.
- **Business impact:** Support load and trust damage during incidents.
- **Security impact:** Low.
- **Reproduction:** docs/operations/fajita-self-monitoring.md
- **Evidence:** src/lib/platform/self-monitoring.ts; src/app/api/health/route.ts
- **Owner:** operations
- **Target date:** 2026-07-28
- **Mitigation:** Create internal fixture org status page and status.fajita.io before Stage 1.
- **Verification test:** Status page reachable when app auth is blocked in drill.
- **Accepted risk:** no
- **Approval:** —
- **Closed date:** —


