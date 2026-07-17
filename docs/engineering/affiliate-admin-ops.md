# Affiliate admin operations (Phase 12G)

Platform-admin tooling for the affiliate program: directory, fraud review,
commission adjustments, reconciliation, and the internal lab. All surfaces are
`/internal/*`, platform-admin gated, and never expose customer identity, tax
numbers, bank details, or raw fraud evidence.

## Directory

- `admin-directory.ts`: `listAffiliates`, `getAffiliateAdminDetail`.
- `/internal/affiliates/directory` and `/directory/[id]`.
- Detail page wires membership controls (`setAffiliateMembershipAction`), fraud
  review, and signed commission adjustments.
- Operator-facing identity is the affiliate's default code and contact email.

## Fraud

- `fraud.ts`: heuristic scan, flag open (idempotent per open type), review
  queue, and resolution.
- Flag types: `self_referral_suspected`, `velocity_clicks`,
  `velocity_conversions`, `high_refund_rate`, `manual_escalation`.
- Evidence stays coarse (counts, rates, booleans). No IPs, emails, or customer
  ids.
- Decisions: `clear`, `hold`, `request_information`, `escalate`, `suspend`,
  `terminate`, `reverse`. Destructive decisions require step-up.
- Effects: payout hold, membership transitions, `fraud_hold` on unpaid
  commissions, and (on `reverse`) ledger `fraud_adjustment` entries that zero
  standing unpaid commissions.
- Worker job `fraud_scan` opens new flags. Queue UI at
  `/internal/affiliates/fraud`.

## Commission adjustments

- `adjustments.ts` / `adjustCommissionAction`.
- Signed integer cents, typed adjustment reason, immutable
  `affiliate_commission_adjustments` row plus ledger
  `manual_correction` or `fraud_adjustment`.
- Step-up required. Audit + `affiliate_admin_actions` recorded.

## Reconciliation

- `reconciliation.ts`:
  - **commission**: compare ledger balance to standing unpaid commissions
    (report-only; no auto rewrite of money).
  - **payout**: release commissions stuck `scheduled` on failed/canceled/
    returned items (repairable).
  - **attribution**: unlock locked attributions with no conversion (repairable).
- Runs record `affiliate_reconciliation_runs`. Live repair requires step-up.
- UI at `/internal/affiliates/ops`. Worker job `reconcile` runs dry-runs of all
  three kinds when requested.

## Lab and fixtures

- `fixtures.ts`: deterministic commission, reversal, and payout-eligibility
  fixtures plus synthetic demo affiliates. Never written to the database.
- `/internal/affiliate-lab`: program terms, calculator tables, eligibility
  matrix, demo directory, and rendered notification HTML/text previews
  (`previewAffiliateNotification`). Nothing sends email or mutates data.
- Unit tests in `fixtures.test.ts` keep fixtures aligned with the calculators.

## Worker jobs

`POST /api/internal/affiliates/run` default jobs:

`mature`, `expire`, `notify`, `fraud_scan`

Optional: `reconcile` (dry-run commission + payout + attribution).

## Known limitations

- Fraud heuristics are intentionally coarse; self-referral detection beyond
  attribution-time checks is not yet a dedicated scan.
- Commission reconciliation reports mismatches but does not invent balancing
  ledger rows.
- Clearing fraud returns `fraud_hold` commissions to `holding` (not their prior
  payable state); the maturation worker advances them again.
- Lab fixtures are in-memory only; no DB seed script for demo tenants.
