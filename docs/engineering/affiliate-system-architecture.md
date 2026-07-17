# Affiliate system architecture (Phase 12)

Internal engineering reference. Not customer-facing. Do not publish program terms
from this document; publication is gated by founder + counsel review.

## Principle

Reward real introductions that become real, retained customers. The affiliate
program lives **inside** the existing Fajita product. It reuses:

- Clerk identity (`user_profiles`) for affiliates and applicants
- Organization billing (Stripe as source of truth) for conversions and revenue
- The audit log (`audit_events`) for operational history
- The analytics model (DataFast) for privacy-safe product events

It never forks identity, billing, or analytics, and never trusts the browser at
payment time.

## Actors and identity

- **Affiliate**: a person, keyed to `user_profiles.id` via `affiliates.user_id`
  (one affiliate per user). Not an organization member.
- **Referred customer**: an **organization**. Billing is org-scoped, so
  attribution and conversion attach to `organizations`, never to a user alone.
- **Platform admin**: `requirePlatformAdmin()` (Clerk id allowlist), entirely
  separate from organization roles and from affiliate permissions.

RLS resolves the caller with `app.current_profile_id()` and
`app.current_affiliate_id()` / `app.owns_affiliate()`.

## Centralized commercial configuration

`src/lib/affiliates/config.ts` is the single source of truth for every
commercial term. Nothing else hardcodes rates, windows, thresholds, or
exclusions. The persisted `affiliate_program_versions` table is seeded from this
module for auditability; the code module stays canonical for calculation.

Provisional launch terms (version 1, `programPublished = false`):

| Term | Value |
| --- | --- |
| Attribution window | 30 days |
| Attribution model | last eligible touch |
| Commission | recurring, 2000 bps (20%) |
| Recurring eligibility | 12 months from first eligible paid invoice |
| Holding period | 30 days after invoice payment |
| Payout threshold | $50.00 (5000 cents) |
| Payout frequency | monthly |
| Currency | USD |
| Eligible plans | starter, pro, business |
| Excludes | tax, refunds, credits, disputes, trials, internal, test mode |
| Affiliate coupons | disabled |
| Reactivation | resumes commission inside original window; never extends it |

Money is always integer minor units (cents). Rates are basis points. No floating
point in money math.

## State model

`src/lib/affiliates/states.ts` keeps every lifecycle concern in a **separate**
field, never overloaded:

- Application: draft, submitted, under_review, needs_information, waitlisted,
  approved, rejected, blocked
- Membership: active, paused, suspended, terminated, closed
- Payout eligibility: not_eligible, below_threshold, tax_information_required,
  payout_setup_required, ready, held
- Tax: not_started, required, submitted, verified, needs_attention, expired,
  not_required, withholding_applied
- Fraud: clear, review, hold, confirmed
- Conversion: attributed_signup, checkout_started, subscription_created,
  payment_pending, confirmed, holding, active, ineligible, fraud_review,
  reversed, canceled, expired
- Commission: pending, holding, approved, payable, scheduled, paid,
  partially_reversed, reversed, disputed, fraud_hold, expired, canceled
- Payout item / batch and eligibility window states as documented in the module.

## Permission model

`src/lib/affiliates/permissions.ts` is separate from org roles. Affiliate-facing
permissions are additionally gated by membership state (suspended affiliates are
read-only). Platform-admin permissions require `requirePlatformAdmin()` and, for
sensitive actions, step-up authentication.

## Data model

Migrations (applied to `olvnjsqspvywvwfchtuc`):

- `20260726000000_phase12_affiliate_schema.sql` (tables)
- `20260726000100_phase12_affiliate_engine.sql` (helpers + program seed)
- `20260726000200_phase12_affiliate_rls.sql` (RLS)

Table groups: program + versions; applications + reviews; affiliates + profile +
email preferences; codes + campaigns + links; sessions + clicks + attributions;
conversions + conversion events + eligibility windows; commissions + adjustments
+ immutable ledger; refund + dispute events; fraud flags + reviews; payout +
tax profiles; payout batches + items + statements; terms acceptances; creatives;
notifications; exports; provider webhook inbox; reconciliation runs; admin
actions.

Invariants enforced in the schema:

- One live application per user (partial unique index).
- One active default code per affiliate.
- At most one active (eligible/locked) attribution per organization.
- One conversion per organization; unique anon ref.
- One commission per eligible invoice per calculation version.
- Ledger idempotency key is unique; ledger rows are append-only.

## RLS posture

Two tiers:

1. An affiliate reads their **own non-identity** data directly (profile, codes,
   campaigns, links, payout/tax status, statements, payout items, notifications,
   exports, terms). Program/versions are readable by any authenticated user.
2. Everything carrying **customer identity or internal detail** (sessions,
   attributions, conversions, conversion events, eligibility windows,
   commissions, adjustments, ledger, clicks, refunds, disputes, fraud, batches,
   webhook inbox, reconciliation, admin actions, application reviews) has RLS
   enabled with **no affiliate policy**. It is reachable only by the service role
   behind authorized server actions, which project anonymized, safe fields.

All writes go through server actions / workers using the service role.

## Integration points wired in 12A

- Feature flag `affiliates` (stage development; platform-admin only until
  reviewed).
- Audit actions `affiliate.*` in `src/lib/app/audit.ts`.
- Analytics goals `affiliate*` in `src/lib/analytics/goals.ts`.
- Env: `AFFILIATE_COOKIE_SECRET`, `AFFILIATE_WORKER_TOKEN`,
  `STRIPE_CONNECT_CLIENT_ID` (all optional; degrade safely).

## Subsequent slices

12B tracking + attribution, 12C applications + identity, 12D conversion +
commission engine, 12E payouts + tax, 12F dashboards + creatives, 12G admin +
fraud + reconciliation, 12H legal + docs + full test suites. See
`/docs/handoff/phase-12-handoff.md` for status.
