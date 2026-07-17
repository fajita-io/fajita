# Phase 12 affiliate test matrix

Honest inventory of automated coverage and remaining gaps. Do not claim load
or RLS suite completion beyond what is listed.

## Automated (unit)

| Area | Location | Status |
| --- | --- | --- |
| Program config / versioning | `config.test.ts` | Passing |
| State machines + fraud decisions | `states.test.ts` | Passing |
| Permissions by membership | `permissions.test.ts` | Passing |
| Destination allowlist | `destinations.test.ts` | Passing |
| Code validation | `code.test.ts` | Passing |
| Cookie encode/decode | `cookie.test.ts` | Passing |
| Commission + reversal math | `commission.test.ts` | Passing |
| Payout eligibility resolver | `payout-eligibility.test.ts` | Passing |
| Lab fixtures vs calculators | `fixtures.test.ts` | Passing |

Command: `npx vitest run src/lib/affiliates`

## Automated (project)

| Check | Status |
| --- | --- |
| `tsc --noEmit` | Required green |
| `next build` (affiliate routes emit) | Required green |
| Site claims tests | Affiliate claims registered as `internal-only` |

## Not yet automated (follow-ups)

| Area | Notes |
| --- | --- |
| RLS isolation | Needs test DB; service-role vs affiliate policies |
| Tracking/bind integration | Session extend, last-touch, self-referral, lock |
| Conversion idempotency | Accrual, refund, dispute, maturation against DB |
| Payout reservation + transfer idempotency | Needs Stripe test mode or mock |
| Fraud scan + resolve | Needs DB fixtures |
| Reconciliation repair | Needs stranded commission fixtures |
| E2E apply → approve → click → convert → payout | Playwright deferred |
| Load / concurrency | Ledger unique keys designed for it; not load-tested |

## Manual / ops verification before public launch

1. Cookie secret set in production
2. Worker token + schedule (mature, expire, notify, fraud_scan)
3. Connect onboarding in Stripe test mode end-to-end
4. Admin approve → affiliate dashboard → export CSV
5. Dry-run reconciliation on staging data
6. Counsel sign-off on Agreement + Privacy Notice drafts
7. Flip `programPublished` only after claims registry update to marketable
