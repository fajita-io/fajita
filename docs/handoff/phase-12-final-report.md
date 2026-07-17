# Phase 12 final report: Affiliate and referral system

Internal. Acquisition-ready summary of what was built, what is verified, and
what must not be claimed publicly.

**Date:** 2026-07-17  
**Supabase project:** `olvnjsqspvywvwfchtuc`  
**Program publication:** `programPublished = true` (public beta)  
**Legal:** Affiliate Program Agreement v1 and Affiliate Privacy Notice v1 in
force (effective 2026-07-17). Review record:
`docs/legal/affiliate-counsel-review.md`.

## Outcome

Phase 12 delivered an end-to-end affiliate system inside the existing Fajita
monorepo: applications, first-party attribution, Stripe-confirmed conversions,
recurring commissions with a holding period, ledger-accurate payouts (Stripe
Connect Express with manual fallback), partner dashboards, notifications,
exports, fraud review, reconciliation, and internal lab fixtures. Commercial
terms are centralized. Legal documents are published and the program is open
for applications under public beta.

## Slice completion

| Slice | Status |
| --- | --- |
| 12A Foundation | Complete (migrations applied live) |
| 12B Tracking + attribution | Core complete |
| 12C Applications + identity | Core complete |
| 12D Conversion + commission | Core complete |
| 12E Payouts + tax (Connect) | Core complete |
| 12F Dashboards, emails, exports, settings | Core complete |
| 12G Admin ops, fraud, reconcile, lab | Core complete |
| 12H Legal, privacy, security, claims, tests, report | Complete; counsel review closed 2026-07-17 |

## What exists in production code

- **Config:** `src/lib/affiliates/config.ts` (versioned terms; rates in bps;
  money in cents; `programPublished = true`)
- **Feature stage:** `affiliates` = `public_beta`
- **Schema:** 35 tables + engine helpers + RLS
- **Tracking:** signed `fj_ref` cookie, `/api/ref`, middleware capture,
  org bind on create
- **Applications:** public apply, admin review, provisioning
- **Engine:** invoice.paid / refund / dispute / cancel → conversions,
  commissions, ledger; worker matures and expires windows
- **Payouts:** eligibility resolver, Connect onboarding, batches, transfers,
  statements, manual settle
- **Partner UI:** overview, performance, links, resources, payouts, settings,
  export
- **Admin UI:** applications, directory, fraud, payouts, reconciliation, lab
- **Notifications:** queue + Resend dispatch (degrades when unconfigured)
- **Legal (in force):** `/legal/affiliate-agreement`, `/legal/affiliate-privacy`

## Verification

- Migrations listed on linked project `olvnjsqspvywvwfchtuc`
- Unit tests under `src/lib/affiliates`
- Typecheck and production build emit affiliate and legal routes
- Claims: program and rate disclosures `available-now`; income guarantees
  remain `internal-only` / prohibited
- Trust evidence register updated for publication

## Must not be claimed (customer-facing)

- Guaranteed income or traffic
- SOC 2 or other certifications related to the program
- That site-wide cookie consent gating is complete (residual; see counsel memo)
- That general Terms of Service or Privacy Policy are in force (still
  in preparation)

## Post-publication ops checklist

1. Confirm production secrets: `AFFILIATE_COOKIE_SECRET`,
   `AFFILIATE_WORKER_TOKEN`, `STRIPE_CONNECT_CLIENT_ID` (or accept manual
   payouts)
2. Schedule worker jobs (mature, expire, notify, fraud_scan, payout cadence)
3. Ship cookie-consent mechanism where required by jurisdiction
4. Publish general Privacy Policy / Cookie Notice when ready

## Known follow-ups (non-blocking for public beta)

Documented per-slice in `docs/handoff/phase-12-handoff.md`: checkout-intent
attribution ref, consent gate, durable rate limiter, RLS/DB integration tests,
multi-currency, tax withholding ledger lines, email retry/dead-letter, seeded
creatives, load tests.

## Document index

| Document | Path |
| --- | --- |
| Architecture | `docs/engineering/affiliate-system-architecture.md` |
| Cookie | `docs/engineering/affiliate-cookie-model.md` |
| Attribution | `docs/engineering/affiliate-attribution.md` |
| Commission engine | `docs/engineering/affiliate-commission-engine.md` |
| Payouts | `docs/engineering/affiliate-payouts.md` |
| Partner experience | `docs/engineering/affiliate-experience.md` |
| Admin ops | `docs/engineering/affiliate-admin-ops.md` |
| Privacy map | `docs/privacy/phase-12-affiliate-data-map.md` |
| Security review | `docs/security/affiliate-attribution-security.md` |
| Analytics | `docs/analytics/application-phase-12-events.md` |
| Counsel review | `docs/legal/affiliate-counsel-review.md` |
| Agreement (source) | `src/lib/legal/affiliate-agreement.ts` |
| Privacy notice (source) | `src/lib/legal/affiliate-privacy.ts` |
| Test matrix | `docs/testing/phase-12-affiliate-matrix.md` |
| Running handoff | `docs/handoff/phase-12-handoff.md` |

## Bottom line

The affiliate system is built, legally published, and open for applications in
public beta. Money paths are ledger-backed and idempotent by design. Income
guarantees remain prohibited. Cookie consent and general site legal suite
remain follow-ups.
