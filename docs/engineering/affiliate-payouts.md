# Affiliate payouts and tax (Phase 12E)

How cleared commission becomes money in an affiliate's account, and how tax
readiness is tracked. Money is always integer cents. Stripe Connect Express is
the payout rail, with a manual fallback when Connect is not configured.

## Principles

- Stripe is the payment authority. We transfer to the affiliate's connected
  Express account; Stripe collects their identity, bank, and tax details during
  onboarding. We never see or store bank or tax numbers.
- A commission is paid at most once. Reservation plus idempotent transfers plus
  guarded state transitions make double payment impossible under retries or
  concurrent batches.
- Every amount reconciles against the immutable ledger. Paying an affiliate
  writes a `commission_paid` ledger entry per commission that zeroes its
  contribution to the balance.
- Nothing here exposes customer identity. Operators see an affiliate's default
  code, amounts, and coarse statuses only.

## Modules

- `payout-eligibility.ts` (pure, tested): `resolvePayoutStatus` answers "can this
  affiliate be paid now, and if not, what unlocks it?" Precedence: held (frozen
  membership or admin hold) -> not eligible (nothing owed) -> below threshold ->
  payout setup required -> tax information required -> ready.
- `payout-provider.ts` (Stripe Connect): ensures a payout profile and connected
  Express account, produces onboarding links, and reconciles account status,
  capabilities, requirements, and tax readiness back into our tables. Reports
  "not configured" and falls back to manual when `STRIPE_CONNECT_CLIENT_ID` is
  unset.
- `payouts.ts` (engine): batch generation, approval, processing (transfers),
  statements, manual settlement, and the affiliate payout overview.

## Payout profile and connected account

`ensurePayoutProfile` lazily creates `affiliate_payout_profiles`. When Connect is
configured, `ensureConnectedAccount` creates a Stripe Express account
(`type: express`, `capabilities.transfers`) keyed idempotently by affiliate id,
storing `connected_account_id` and status `onboarding`.

`createOnboardingLink` returns a Stripe account link with return and refresh URLs
pointing at `/affiliate/payouts`. `refreshAccountStatus` retrieves the account
and maps it to our coarse enum:

| Stripe account state | Our status |
| --- | --- |
| `details_submitted` false | `onboarding` |
| `requirements.disabled_reason` set | `restricted` |
| `capabilities.transfers = active` and `payouts_enabled` | `enabled` |
| otherwise | `restricted` |

Tax readiness is mirrored from the account's outstanding requirements into
`affiliate_tax_profiles` (`not_required`, `required`, or `needs_attention`).
Express collects US and international tax forms during onboarding, so the
platform does not gather tax numbers directly.

## Batch lifecycle

States: `review -> approved -> processing -> completed | partially_completed |
failed`.

1. Generate (`generatePayoutBatch`): sum standing `payable` commission per
   affiliate, resolve payout status against profile + tax + threshold, and write
   one `affiliate_payout_items` row per affiliate with its status. For `ready`
   items, reserve the commissions by moving them `payable -> scheduled` and
   stamping `payout_item_id`. Batch totals count only ready items. No money
   moves. Batch opens in `review`.
2. Approve (`approvePayoutBatch`): `review -> approved`, records approver.
3. Process (`processPayoutBatch`, step-up gated): for each ready/scheduled item,
   - Stripe Connect enabled: create a transfer to the connected account with
     idempotency key `payout_item:{id}`, mark the item `paid`, move reserved
     commissions `scheduled -> paid`, and write `commission_paid` ledger entries
     (`paid:{item}:{commission}`) summing to the item total. Generate a
     statement.
     - not enabled at process time: item -> `payout_setup_required`, reservation
       released back to `payable`.
     - transfer error: item -> `failed`, reservation released back to `payable`,
       audit `affiliate.payout_failed`. A later batch retries the balance.
   - Manual provider (no Connect): item left `scheduled` for an operator to
     settle by hand (`markPayoutItemPaidManually`), which performs the same
     ledger and statement writes.

Batch finalization: all items resolved and no failures -> `completed`; some
paid, some failed -> `partially_completed`; none paid -> `failed`.

## Idempotency and safety

- Transfers use `idempotencyKey: payout_item:{id}`, so reprocessing a batch
  never sends a second transfer for the same item.
- Ledger writes upsert on `idempotency_key` with `ignoreDuplicates`, so paid
  entries are written at most once.
- Commission state transitions are guarded (`.eq("state", "scheduled")`), so a
  commission is only ever paid from a reserved state.
- Reservations mean a commission can be in exactly one open batch item at a time.

## Eligibility and thresholds

All commercial terms come from `config.ts`: `minimumPayoutThresholdCents`
($50 provisional), `currency` (usd), and payout frequency (monthly). Balances
below the threshold carry forward and surface as `below_threshold` on the
affiliate dashboard.

## Surfaces

- Affiliate: `/affiliate/payouts` shows payable balance, the payout minimum,
  payout setup (Connect onboarding or the manual-settlement notice), and
  statements. Setup returns from Stripe to `?setup=return`, which reconciles
  account status automatically.
- Admin: `/internal/affiliates/payouts` generates and lists batches;
  `/internal/affiliates/payouts/[id]` shows items and drives approve, process
  (step-up), and manual settlement. Processing requires platform admin and
  step-up authentication.

## Known limitations (follow-ups)

- Currency is assumed USD; multi-currency payouts are not implemented.
- Provider fees and tax withholding ledger lines exist in the schema but are set
  to zero this phase (net equals gross). Withholding wiring lands with a real
  tax-withholding policy.
- Negative balances (clawbacks exceeding payable) are represented in the ledger
  but not yet netted into a future payout as a negative adjustment line.
- Batch generation and processing are admin-triggered; a scheduled monthly
  cadence is external and not yet wired.
- Integration tests against a test database (reservation, transfer idempotency,
  failure revert, manual settlement, statement math) are pending.
