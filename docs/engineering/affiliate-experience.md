# Affiliate experience (Phase 12F)

The affiliate-facing dashboard beyond overview and links: performance, resources,
settings, exports, and lifecycle notifications. All surfaces are person-scoped
(gated on being an approved affiliate, never an org role) and never expose
customer identity.

## Navigation

`/affiliate` shell (`(affiliate)` route group) with tabs: Overview, Performance,
Links, Resources, Payouts, Settings.

## Performance (`/affiliate/performance`)

`metrics.ts::getPerformanceSummary` aggregates the affiliate's own tracking rows
into an honest funnel: eligible clicks (human, attribution-eligible), referred
signups (sessions attached to a user), and active referrals (conversions in
active/holding/confirmed). Filtered clicks (bots, duplicates, self visits) are
shown as a delta, never hidden. A per-campaign click breakdown resolves campaign
names. No customer identity, no revenue leakage.

## Resources (`/affiliate/resources`)

The affiliate's default referral link plus ready-to-use copy snippets built from
that link. Copy is Draper-voice and honest: it markets Fajita's real
capabilities, never fabricated numbers. Copying a snippet fires a
non-identifying `affiliate_creative_downloaded` goal. Brand-asset downloads read
`affiliate_creatives` (empty for now, with an honest "on the way" state).

## Settings (`/affiliate/settings`)

- Profile: display name, contact email, website (`profile.ts` +
  `updateProfileAction`). Contact email is where program mail is sent.
- Email preferences: five optional categories mapped to
  `affiliate_email_preferences`. Account and security messages always send.
- Export: CSV download links for commissions and statements.
- Close account: typed-confirmation closure for active/paused affiliates. Cleared
  balances are still paid; history stays readable.

Write permissions follow membership state via `affiliatePermissionsFor`.
Suspended/terminated affiliates see read-only forms.

## Exports (`/affiliate/export`)

`GET /affiliate/export?kind=commissions|statements` (`exports.ts`). Requires the
`affiliate.export` permission and returns a CSV of the caller's own data only:
amounts in dollars, states, timestamps. No customer identity, org ids, or Stripe
ids. Each export records an `affiliate_exports` row, an audit event, and a
non-identifying analytics goal. CSV cells are quoted and escaped.

## Notifications (`notifications.ts`)

Affiliate-facing email through the shared Resend transactional stream, reusing
the lifecycle email shell (`Fajita Partners` sender). Every message is recorded
in `affiliate_notifications`, idempotent per dedupe key.

Kinds and triggers:

| Kind | Trigger | Preference gate |
| --- | --- | --- |
| `approved` | application approved (`provisioning.approveApplication`) | required |
| `first_commission` | first conversion confirmed (`conversions.ensureConversion`) | commission_notifications |
| `payout_sent` | payout transfer or manual settlement (`payouts.ts`) | payout_notifications |
| `account_closed` | affiliate or admin closes the account | required |

Delivery model:

- `queueAffiliateNotification` inserts a row (pending, or `skipped` when the
  affiliate opted out of an optional category). It swallows errors so it never
  breaks commission or payout processing.
- `dispatchAffiliateNotifications` (worker `notify` job) claims pending rows,
  resolves the contact email (profile override, then account email), renders,
  and sends. With no provider configured, or on a transient failure, the row is
  marked `skipped` (no spin). A real provider + retry/backoff policy is a
  follow-up.

Worker: `POST /api/internal/affiliates/run` now runs `mature`, `expire`, and
`notify` by default.

## Known limitations (follow-ups)

- Email retry/backoff and a dead-letter path are not implemented; failures are
  marked `skipped`. Wire a real delivery policy with the lifecycle system.
- In-app notification channel exists in the schema but only email is delivered.
- Brand-asset creatives require storage; none are seeded yet.
- Exports are generated inline (no async job or signed-URL storage); fine at
  current data sizes.
- Profile channel links (`channel_links`) are not yet editable from the UI.
