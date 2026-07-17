# Affiliate attribution (Phase 12)

Internal engineering reference. Not customer-facing.

## Model

**Last eligible affiliate touch within the 30-day window before the customer's
attributable account/organization creation.** Version 1. Versioned in
`src/lib/affiliates/config.ts` and stamped on every session, attribution, and
conversion (`model_version` / `program_version`). The model is never changed
without a new version and notice.

## What counts as a touch

An eligible referral visit: a top-level, human-likely navigation to an
allowlisted destination through a valid, active affiliate code. Recorded as an
`affiliate_clicks` row and folded into an `affiliate_sessions` row.

## What resets / replaces / invalidates

- A later eligible touch by the SAME affiliate extends the existing session.
- A later eligible touch by a DIFFERENT affiliate starts a new session; the
  cookie points at the newest session, so last-touch wins before conversion.
- Bot-likely, invalid, or non-document requests are recorded for quality metrics
  but never create or extend a session (no attribution).
- Direct/organic visits do not erase a valid attribution during the window
  (marketing attribution is separate from affiliate eligibility).

## Attribution moment (server-side, durable)

1. Referral visit creates/updates an anonymous `affiliate_sessions` row and sets
   the cookie.
2. User signs in / signs up: the session is attached to the user
   (`attachUserToReferralSession`).
3. Organization created: `attachOrganizationAttribution` writes an
   `affiliate_attributions` row for the org (`bindReferralOnOrgCreation`).
4. Checkout references the organization's attribution.
5. A Stripe-verified paid invoice (12D) creates the conversion and locks
   attribution.

The browser cookie is never trusted at payment time; the server-side
`affiliate_attributions` row is authoritative.

## Organization attribution rules (enforced in `tracking.ts`)

- One active (eligible/locked) attribution per organization
  (`affiliate_attributions_one_active_idx`).
- Existing paid organizations (`billing_subscriptions.access_state` in
  active/grace) are never reattributed: an `ineligible` row is recorded with
  reason `existing_paid_customer`.
- Self-referrals (affiliate is a member of the org) are `ineligible` with reason
  `self_referral`.
- Once a conversion exists for the org, attribution is locked and never
  replaced (`conversion_locked`).
- Otherwise last-touch replacement: the prior `eligible` row is set to
  `replaced` and the new one becomes `eligible`. Attribution history is
  preserved, never destroyed.

## Existing accounts

- An existing user with no prior paid organization may be attributed if they
  click and create a new eligible paid organization within the window.
- Existing paying organizations are not reattributed.
- Upgrades by an already-attributed customer continue under the original
  conversion's eligibility window (12D), never restarting it.

## Privacy

Affiliates never see visitor identity, signup email, organization name, billing
detail, or product data. Attribution and conversion rows carry organization ids
and Stripe identifiers and are therefore service-role only (RLS enabled, no
affiliate policy); the dashboard projects an anonymous `anon_ref` and safe
fields only. See `/docs/security/affiliate-attribution-security.md` (pending) and
the RLS migration.

## Files

- `src/lib/affiliates/tracking.ts` (sessions, clicks, attribution binding)
- `src/lib/affiliates/cookie.ts`, `destinations.ts`, `code.ts`
- `src/app/api/ref/route.ts`, `src/middleware.ts`
- `src/lib/affiliates/bind.ts` (org-creation hook)
