# Phase 12 handoff and status

Internal. Honest running status of the affiliate program build. Phase 12 is large
(sections 1-134 of the directive) and is being built as reviewable vertical
slices. This document tracks what is live, verified, and remaining. Do not
represent unbuilt slices as complete, and do not publish provisional program
terms.

## Slice status

| Slice | Scope | Status |
| --- | --- | --- |
| 12A | Foundation: config, data model, RLS, engine, wiring, docs | Complete, verified, migrations applied live |
| 12B | Tracking + attribution | Core complete + tested; remaining items below |
| 12C | Applications + affiliate identity | Core complete + built/typechecked; remaining items below |
| 12D | Conversion + commission engine | Core complete + built/typechecked; remaining items below |
| 12E | Payouts + tax (Stripe Connect) | Core complete + built/typechecked; remaining items below |
| 12F | Dashboards, creatives, exports, emails, settings | Core complete + built/typechecked; remaining items below |
| 12G | Admin ops, fraud review, reconciliation, lab, fixtures | Core complete + built/typechecked; remaining items below |
| 12H | Legal drafts, privacy map, security review, test matrix, claims registry, final report | Complete; counsel review closed; documents in force 2026-07-17 |

## 12A (complete)

- Centralized versioned config: `src/lib/affiliates/config.ts` (version 1
  Launch, `programPublished = true`). Rates in bps, money in cents.
- State model: `src/lib/affiliates/states.ts` (separate machines for
  application, membership, payout eligibility, tax, fraud, conversion,
  commission, payout item/batch, eligibility window).
- Permission model: `src/lib/affiliates/permissions.ts` (separate from org
  roles; membership-state gated; platform-admin set).
- Migrations applied to `olvnjsqspvywvwfchtuc`:
  - `20260726000000_phase12_affiliate_schema.sql` (35 tables)
  - `20260726000100_phase12_affiliate_engine.sql` (helpers + program seed)
  - `20260726000200_phase12_affiliate_rls.sql` (RLS)
- Wiring: feature flag description, `affiliate.*` audit actions, `affiliate*`
  analytics goals, env vars (`AFFILIATE_COOKIE_SECRET`, `AFFILIATE_WORKER_TOKEN`,
  `STRIPE_CONNECT_CLIENT_ID`), regenerated `src/lib/supabase/types.ts`.
- Docs: `docs/engineering/affiliate-system-architecture.md`.
- Tests: config, states, permissions (16).

## 12B (core complete)

Built and verified:

- Destination allowlist / open-redirect defense: `destinations.ts` (+ tests).
- Affiliate code normalization/validation (reserved, impersonation, profanity,
  email): `code.ts` (+ tests).
- Signed first-party referral cookie (HMAC, tamper/expiry checks): `cookie.ts`
  (+ tests).
- Server tracking: bot classification, click + session recording, last-touch
  session handling: `tracking.ts`.
- Attribution binding: user attach + organization attribution with
  self-referral, existing-paid-customer, last-touch replacement, and
  conversion-lock guards: `tracking.ts`, `bind.ts`.
- Referral redirect endpoint (Node runtime, rate-limited, Sec-Fetch-Dest guard):
  `src/app/api/ref/route.ts`.
- Middleware `?ref=` capture on primary host, document navigations only:
  `src/middleware.ts`.
- Org-creation hook wired into `createOrganizationAction`.
- Docs: `affiliate-cookie-model.md`, `affiliate-attribution.md`.
- Tests total across affiliates: 32 passing. Full `tsc` clean. Lint clean.

Remaining 12B follow-ups:

- Checkout intent should carry/reference the server-side org attribution
  explicitly (currently attribution is on the org row; 12D reads it at invoice
  time). Add an attribution reference to `billing_checkout_intents` handling if
  needed.
- Consent-gating hook for the referral cookie where a jurisdiction requires it.
- Durable (edge/KV) rate limiter for `/api/ref` to replace the per-instance
  guard.
- Attribution + cookie security review docs
  (`docs/security/affiliate-attribution-security.md`).
- Unit/integration tests for `tracking.ts` and `bind.ts` against a test DB
  (session extension, last-touch replacement, self-referral, existing-customer,
  lock), and RLS isolation tests for the new tables.

## 12C (core complete)

Built, typechecked, linted, and included in a successful `next build`:

- Service layer:
  - `applications.ts`: submit (one-live-application, blocked/rejected-cooldown
    guards, terms-acceptance snapshot), admin list/detail/count, non-approve
    review decisions.
  - `provisioning.ts`: `approveApplication` (provisions affiliate + profile +
    email prefs + unique default code + default link + terms acceptance, updates
    application, writes review) and `setMembershipState` (transition-guarded
    pause/suspend/reactivate/terminate/close). No money touched.
  - `links.ts`: codes, campaigns, links CRUD and `buildReferralUrl` (allowlisted
    marketing URL with `?ref=`/`?fjc=`).
  - `context.ts`: affiliate guards (`requireAffiliate`,
    `requireAffiliatePermission`) and program-access gates
    (`canAccessAffiliateProgram`, `requireAffiliateProgramAccess`).
- Server actions (audited + analytics):
  - `actions/apply.ts`: `submitApplicationAction` (auth-gated, program-gated,
    never auto-approves).
  - `actions/admin.ts`: `approveApplicationAction`, `reviewApplicationAction`,
    `setAffiliateMembershipAction` (platform-admin only).
  - `actions/links.ts`: create code/campaign/link, archive campaign
    (affiliate-permission gated).
- Routes/UI:
  - Public `/affiliates` and `/affiliates/apply` (published; Program Terms live;
    links to Agreement and Privacy Notice).
  - Affiliate dashboard group `(affiliate)`: `/affiliate` overview (default link
    + copy, status, terms) and `/affiliate/links` (link builder, campaigns,
    codes).
  - Admin `/internal/affiliates` queue and
    `/internal/affiliates/applications/[id]` review (approve + decisions),
    platform-admin guarded.
- Config: `AFFILIATE_TERMS_VERSION`, `AFFILIATE_PRIVACY_VERSION` added.
- Destination allowlist corrected to real public routes (feature detail pages,
  pricing, integrations, security).
- Tests: 33 passing (added code-rejection-message coverage).

Remaining 12C follow-ups:

- Applicant "needs information" reopen/edit flow (currently the apply form
  re-submits; a true resume/edit of the same application is not built).
- Affiliate profile edit (display name, contact email, channels) and additional
  code default-switching / retiring from the dashboard.
- Admin affiliate directory + affiliate detail page with membership lifecycle
  controls wired to `setAffiliateMembershipAction` (action exists; no dedicated
  admin affiliate page yet).
- Applicant + admin notification emails on submit/approve/reject (12F/lifecycle).
- Integration/RLS tests for provisioning and application review against a test
  DB.

## 12D (core complete)

Built, typechecked, linted, tested, and included in a successful `next build`:

- Pure calculator `commission.ts` (+ tests): `computeCommission` (tax exclusion,
  floored, non-negative) and `computeReversal` (cumulative-aware proportional
  reversal, never over-reverses).
- Engine `conversions.ts` (service-role, idempotent):
  - `processInvoicePaidForAffiliate`: attribution -> conversion (locks
    attribution, opens eligibility window) -> commission (`holding`,
    hold_release_at) -> ledger `commission_accrued`. Guards: zero/trial invoices,
    test-mode exclusion, membership accrual freeze, plan eligibility, window
    bounds, subscription-only, retry-on-unsynced.
  - `processRefundForAffiliate`: idempotent refund event + proportional reversal
    + ledger `refund_reversal`.
  - `processDisputeForAffiliate`: opened -> `disputed` (hold), won -> restore,
    lost -> full reversal + ledger `dispute_reversal`.
  - `processSubscriptionCanceledForAffiliate`: conversion `canceled`, window
    ended.
  - `expireEligibilityWindows` and `releaseMaturedCommissions` (holding ->
    payable) for the worker.
- Webhook wiring: `src/lib/billing/webhook-processor.ts` calls the affiliate
  engine from `invoice.paid`, `customer.subscription.deleted`, `charge.refunded`,
  and adds `charge.dispute.created` / `charge.dispute.closed`. Failures propagate
  for idempotent retry.
- Worker route `POST /api/internal/affiliates/run` (bearer
  `AFFILIATE_WORKER_TOKEN`, jobs `expire`, `mature`).
- Earnings projection `earnings.ts` surfaced on the affiliate overview
  (holding/payable/paid).
- Docs: `docs/engineering/affiliate-commission-engine.md`.
- Tests: 42 passing (added commission calculator + reversal coverage).

Remaining 12D follow-ups:

- Internal-org exclusion (`excludeInternalOrganizations`) needs an org marker;
  not yet enforced.
- Currency handling assumes USD; multi-currency conversion is not implemented.
- Credits/discount exclusions rely on Stripe `amount_paid` being post-credit;
  no explicit credit ledger line.
- Integration tests against a test DB (accrual idempotency, refund/dispute
  reversal, maturation, window expiry) and an admin commission-adjustment path.
- Scheduling for the worker (cron trigger) is external and not yet configured.

## 12E (core complete)

- Pure eligibility resolver: `src/lib/affiliates/payout-eligibility.ts`
  (`resolvePayoutStatus`), fully unit tested. Precedence: held -> not eligible
  -> below threshold -> setup required -> tax required -> ready.
- Stripe Connect provider: `src/lib/affiliates/payout-provider.ts`. Express
  account creation (idempotent), onboarding links, and status/capabilities/
  requirements/tax reconciliation into `affiliate_payout_profiles` and
  `affiliate_tax_profiles`. Reports not-configured and falls back to manual when
  `STRIPE_CONNECT_CLIENT_ID` is unset.
- Payout engine: `src/lib/affiliates/payouts.ts`. Batch generate (reserves
  `payable -> scheduled`), approve, process (idempotent Stripe transfers keyed
  `payout_item:{id}`, `commission_paid` ledger, statements), manual settlement,
  and the affiliate payout overview. Failures revert reservations to `payable`.
- Actions: `actions/payouts.ts` (affiliate: start/refresh payout setup) and
  `actions/payout-ops.ts` (admin: generate, approve, process, manual settle).
  Processing and manual settlement require platform admin + step-up.
- Surfaces: `/affiliate/payouts` (balance, setup, statements) and
  `/internal/affiliates/payouts` + `/internal/affiliates/payouts/[id]`.
- Env documented in `.env.example`: `AFFILIATE_COOKIE_SECRET`,
  `AFFILIATE_WORKER_TOKEN`, `STRIPE_CONNECT_CLIENT_ID`.
- Docs: `docs/engineering/affiliate-payouts.md`.

Remaining 12E follow-ups:

- Multi-currency payouts (USD assumed).
- Provider-fee and tax-withholding ledger lines are zero this phase (net equals
  gross); wire withholding when a real tax policy exists.
- Negative-balance carry (clawbacks exceeding payable) as a negative adjustment
  line on a future payout.
- Scheduled monthly cadence (external cron) for batch generation.
- Integration tests against a test DB (reservation, transfer idempotency,
  failure revert, manual settlement, statement math).

## 12F (core complete)

- Notifications: `src/lib/affiliates/notifications.ts`. Records
  `affiliate_notifications` (idempotent per dedupe key), honors email
  preferences, and delivers through the shared Resend stream using the lifecycle
  email shell (`Fajita Partners` sender). Kinds: approved, first_commission,
  payout_sent, account_closed. Triggered from provisioning, conversions, and
  payouts. Delivered by the worker `notify` job
  (`dispatchAffiliateNotifications`). Degrades to `skipped` with no provider.
- Settings: `/affiliate/settings` with profile edit, email preferences, CSV
  export links, and typed-confirmation account closure. Data + mutations in
  `profile.ts` and `actions/settings.ts`. New audit actions
  `affiliate.profile_updated`, `affiliate.email_preferences_updated`.
- Performance: `/affiliate/performance` with an honest funnel (eligible clicks,
  signups, active referrals) and per-campaign breakdown (`metrics.ts`).
- Resources: `/affiliate/resources` with the referral link and Draper-voice copy
  snippets (copy fires a non-identifying goal) plus a creatives library state.
- Exports: `GET /affiliate/export?kind=commissions|statements` (`exports.ts`),
  permission-gated, own-data-only CSV, records `affiliate_exports` + audit +
  analytics goal.
- Nav updated: Overview, Performance, Links, Resources, Payouts, Settings.
- Docs: `docs/engineering/affiliate-experience.md`.

Remaining 12F follow-ups:

- Email retry/backoff + dead-letter (failures currently mark `skipped`).
- In-app notification channel (schema exists; only email delivered).
- Seeded brand-asset creatives with storage + signed downloads.
- Editable profile channel links (`channel_links`).
- Async export jobs / signed-URL storage (currently inline CSV).

## 12G (core complete)

- Admin directory: `admin-directory.ts`, `/internal/affiliates/directory` and
  `/directory/[id]` with membership controls, fraud review, and adjustments.
- Fraud: `fraud.ts` heuristic scan (velocity clicks/conversions, high refund
  rate), idempotent flags, review decisions with payout hold / membership /
  commission freeze / unpaid reversal. Queue at `/internal/affiliates/fraud`.
  Worker job `fraud_scan`.
- Adjustments: `adjustments.ts` signed cents + ledger + audit + admin action
  log. Step-up gated.
- Reconciliation: `reconciliation.ts` commission (report), payout (repair
  stranded scheduled), attribution (unlock orphans). UI at
  `/internal/affiliates/ops`. Optional worker job `reconcile` (dry-run).
- Lab + fixtures: `fixtures.ts` + `fixtures.test.ts`,
  `/internal/affiliate-lab` with calculator tables, eligibility matrix, demo
  directory, and notification HTML previews. No DB writes, no sends.
- Docs: `docs/engineering/affiliate-admin-ops.md`.

Remaining 12G follow-ups:

- Richer self-referral fraud scan beyond attribution-time checks.
- Auto-balancing ledger repairs for commission mismatches (currently report-only).
- Restore prior commission state on fraud clear (currently returns to holding).
- Optional DB seed script for demo tenants (lab is in-memory only).

## 12H (complete)

- Legal drafts (internal, not in force):
  `docs/legal/affiliate-agreement-draft.md`,
  `docs/legal/affiliate-privacy-notice-draft.md`. Listed on `/legal` hub as
  in-preparation without published hrefs.
- Privacy map: `docs/privacy/phase-12-affiliate-data-map.md`; data inventory
  updated.
- Security review: `docs/security/affiliate-attribution-security.md`.
- Analytics events: `docs/analytics/application-phase-12-events.md`.
- Claims: `affiliate-program`, `affiliate-commission-rate`,
  `affiliate-income-guarantee` registered as `internal-only` in
  `src/lib/site/claims.ts`; trust evidence register updated.
- Test matrix: `docs/testing/phase-12-affiliate-matrix.md` (honest unit
  coverage vs pending RLS/E2E/load).
- Final report: `docs/handoff/phase-12-final-report.md`.

## Verified environment facts

- Supabase project `olvnjsqspvywvwfchtuc` migration history includes the three
  phase12 migrations (`supabase migration list --linked`).
- Affiliate unit tests under `src/lib/affiliates`; typecheck and build required
  green before considering the phase closed.
- `programPublished` is `true`; affiliates feature stage is `public_beta`.
- Legal docs in force at `/legal/affiliate-agreement` and
  `/legal/affiliate-privacy` (see `docs/legal/affiliate-counsel-review.md`).

## Must not be claimed publicly

- Guaranteed affiliate income, earnings, or traffic
- That site-wide cookie consent gating is complete
- That general Terms of Service or Privacy Policy are in force
- Completion of load tests or full RLS suite
- Negative-balance carry and tax withholding as fully productized ledger behavior

Cross-slice engineering follow-ups remain listed under 12B–12G above. Launch
requires the pre-launch gate in `phase-12-final-report.md`.
