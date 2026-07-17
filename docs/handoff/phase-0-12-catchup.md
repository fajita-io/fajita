# Phases 0–12 catch-up (2026-07-17)

Internal. What was completed to bring the repo in pace with the phased plan
after Phase 12 counsel review.

## Launch gates flipped

| Gate | Before | After |
| --- | --- | --- |
| `accountsOpen` | false | **true** (CTAs → `/signup`) |
| Product feature stages (incidents, maintenance, status pages, subscribers, integrations, billing) | private_beta / development | **public_beta** |
| Affiliates | public_beta | unchanged |
| `pricingConfig.published` | false | **true** ($9 / $19 / $39 monthly from catalog) |
| `BILLING_ENFORCEMENT_ENABLED` | n/a | **false** (unbilled orgs keep beta entitlements until Stripe Prices are verified live) |
| Legal suite | mostly in-preparation | Terms, Privacy, Cookies, AUP, Refunds, Disclosure, Affiliate Agreement, Affiliate Privacy **in force** |
| Claims | mostly at-launch | shipped product claims **available-now** |

## Engineering closed in this catch-up

- Cookie consent banner + referral cookie respect for necessary-only
- Vercel Cron `GET /api/cron/tick` (`vercel.json` hourly) + `CRON_SECRET`
- `organizations.is_internal` + affiliate commission exclusion
- Business plan monitor limit aligned to unlimited (`null`)
- Pricing comparison rows mirror catalog entitlements
- Sitemap / llms.txt / footer legal links updated

## Still external / ops (cannot finish in code alone)

- Set production secrets: `CRON_SECRET`, worker tokens, `AFFILIATE_COOKIE_SECRET`, Resend, Stripe Connect
- Confirm Stripe Prices exist for every `fajita_*` lookup key at published cents
- Flip `BILLING_ENFORCEMENT_ENABLED` when paid checkout should lock unbilled orgs
- DPA, SLA, Subprocessor list remain in-preparation
- Load/E2E matrices and sample-monitor fixture remain deferred as documented in phase handoffs
- Pamphlet (Phase 16) remains development

## Honesty note

Maturity-memory files written at install baseline still contain stale
`[UNRESOLVED]` rows for systems that later phases shipped. Product truth is in
code, feature flags, claims, and phase handoffs. A full maturity-memory rewrite
is follow-up documentation, not a product blocker.
