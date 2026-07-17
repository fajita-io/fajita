# Data inventory

Every category of data Fajita stores or processes. Governed by `security-and-privacy.mdc`. Update via `security-and-privacy-architect`. Do not invent stored data; list only what exists or is concretely planned, and mark the difference.

**Status legend:** Known = in repo today · Planned = concretely intended · `[UNRESOLVED]` = undecided

---

## Known / configured today

| Category | Example fields | Source | Storage | Purpose | Sensitivity | User visibility | Admin visibility | Third-party processors | Retention | Export | Deletion | Logging restrictions | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Billing account | `user_id`, `stripe_customer_id`, `email` | Checkout / webhook | Supabase `billing_accounts` | Link user to Stripe customer | Medium (email is PII) | Own record | Support `[UNRESOLVED]` | Stripe | `[UNRESOLVED]` | `[UNRESOLVED]` | Cascade on account delete | No secrets; email is PII, keep out of analytics | Known (table exists, unpopulated) |
| Billing subscription cache | `stripe_subscription_id`, `plan_id`, `status`, `monitor_limit`, `current_period_end`, `cancel_at_period_end` | Stripe webhook (planned) | Supabase `billing_subscriptions` | Fast entitlement checks (mirror of Stripe) | Low/Medium | Own plan/status | Support `[UNRESOLVED]` | Stripe | Until subscription ends + `[UNRESOLVED]` | `[UNRESOLVED]` | Cascade on account delete | No card data | Known (table exists, not yet written by webhook) |
| Payment data | Card, payment method, invoices | Customer via Stripe | Stripe (not in app) | Payments | High | Via Stripe portal | None in app | Stripe | Per Stripe | Via Stripe | Per Stripe | Never stored or logged app-side | Known (Stripe-hosted) |
| Product analytics | Pageviews, goals, non-PII metadata | Client + server events | DataFast | Product measurement | Low (must stay non-PII) | None | Aggregate | DataFast | Per DataFast | N/A | N/A | No PII, no secrets in goal params | Known (wired) |
| AI crawler traffic | Request signals from bots | Middleware | DataFast | Bot-traffic visibility | Low | None | Aggregate | DataFast | Per DataFast | N/A | N/A | No user PII | Known (`src/middleware.ts`) |

## Planned (identity and product)

| Category | Example fields | Source | Storage | Sensitivity | Notes | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Identity / account | User ID, email, name, auth factors | Clerk | Clerk (not app tables) | High | No raw credentials in app tables; delete via Clerk | Planned |
| Monitors | Target URL, type, interval, status | User | `[UNRESOLVED]` (Supabase) | Medium | Core product data; tenant-scoped | `[UNRESOLVED]` |
| Incidents | Timeline, severity, updates | System + user | `[UNRESOLVED]` | Medium | May feed public status pages | `[UNRESOLVED]` |
| Status pages | Public config, published incidents | User | `[UNRESOLVED]` | Low (public by design) | Must not leak private targets/config | `[UNRESOLVED]` |
| Alert channels | Email/other endpoints | User | `[UNRESOLVED]` | Medium (contact PII) | Verify ownership before sending | `[UNRESOLVED]` |
| Team / workspace | Members, roles, invites | User | `[UNRESOLVED]` | Medium | Isolation required | `[UNRESOLVED]` |

## Third-party processors (current)

- Stripe (payments, billing state). Known.
- Clerk (identity). Planned.
- Supabase (application database). Known.
- DataFast (product + bot analytics). Known.
- Vercel (hosting). Known.
- Anthropic (AI), if an AI feature ships. `[UNRESOLVED]`.

## Cross-cutting rules

- Email addresses are PII: keep out of analytics and logs; store only where needed.
- Payment details never touch app storage or logs.
- Retention, export, and deletion behavior for product data is `[UNRESOLVED]` and must be defined before those features ship.

## Phase 3 additions (2026-07-17)

Account-foundation data now exists. Full field-level map: `docs/privacy/phase-3-data-map.md`.

New tables (all RLS-protected): `user_profiles`, `user_preferences`, `notification_preferences`, `organizations`, `organization_members`, `organization_invitations` (hashed tokens only), `organization_onboarding`, `audit_events`, `notifications`, `export_requests`, `deletion_requests`, `feature_flag_overrides`.

Data-minimization held: no phone, address, job title, revenue, device fingerprinting, standing IP logs, or monitoring-target data. Audit events store no IP/user-agent by default. Analytics carries ids and coarse enums only, never emails, org names, tokens, or secrets.

Retention/export/deletion: export and deletion request models exist with cooling-off and ownership-conflict protection; artifact generation and the deletion worker are deferred (documented).

## Phase 12 additions (2026-07-17)

Affiliate program data model applied (35 tables). Full map:
`docs/privacy/phase-12-affiliate-data-map.md`. Legal drafts (not in force):
`docs/legal/affiliate-agreement-draft.md`,
`docs/legal/affiliate-privacy-notice-draft.md`.

Categories include applications, affiliate profiles, referral sessions/clicks,
org attributions, conversions, commissions, immutable ledger, fraud flags,
payout/tax profiles, payout batches/items/statements, notifications, exports.
Money is integer cents. Affiliates never receive Referred Customer identity.
Stripe Connect holds bank/tax collection when configured.

Program is published (`programPublished = true`, public beta). Rates may be
stated as current Program Terms. Income guarantees remain prohibited.

## Status

Installation baseline recorded 2026-07-16. Phase 3 account-foundation data added 2026-07-17. Phase 12 affiliate data mapped 2026-07-17. Monitoring/product-data rows remain to be populated in later phases.
