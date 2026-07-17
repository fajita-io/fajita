# Public claims registry (Phase 2)

Source of truth: `src/lib/site/claims.ts`. This document explains the
system; the code holds the claims.

## How it works

Every capability the website may mention is registered with a status:

| Status | Meaning | Where it may appear |
| --- | --- | --- |
| `available-now` | Live and verifiable today | Anywhere |
| `at-launch` | Committed launch scope | Product copy with the early-access frame; never presented as live today |
| `planned` | Under consideration or post-launch | Roadmap only |
| `internal-only` | Never marketed | Nowhere |
| `deprecated` | Removed | Nowhere |

`isMarketable(id)` returns true only for `available-now` and
`at-launch`. Tests (`tests/site-content.test.ts`) enforce that planned
capabilities (multi-region verification, Teams, SMS, dollar pricing) and
prohibited claims (certifications) are not marketable, and that the
integrations page lists only approved channels.

## Currently notable entries

- **Marketable at launch:** website/API/SSL/cron/heartbeat monitoring,
  verify-before-alert, email/Slack/Discord/webhook alerts, recovery
  notices, status pages (components, timelines, maintenance, history,
  subscribers, custom domain, customer branding), uptime history, data
  export, team access, no-agent, three plans with monitor limits,
  monthly and annual intervals, cancel anytime.
- **Roadmap only:** multi-region verification, Microsoft Teams, SMS and
  phone alerts, retention windows, dollar pricing.
- **Prohibited:** SOC 2, ISO 27001, HIPAA, penetration tests, audits,
  uptime guarantees. `security-certifications` is `internal-only` with a
  PROHIBITED note.
- **Affiliate (Phase 12, public beta):** `affiliate-program` and
  `affiliate-commission-rate` are `available-now` (state as current Program
  Terms, not guarantees). `affiliate-income-guarantee` remains
  `internal-only` / PROHIBITED. See `docs/legal/affiliate-counsel-review.md`.
- **Pricing:** `pricing-amounts` is `available-now` from `BILLING_CATALOG`
  via `src/lib/site/pricing.ts`. Keep Stripe lookup-key prices aligned.
- **Accounts:** `accountsOpen = true` in `site-config.ts`. Product features
  through Phase 16 are `public_beta` or `ga` for shipped product areas.
  Ask Fajita (`support-chatbot`) is `available-now` with Powered by Pamphlet.
  Do not claim autonomous chat actions or human SLAs (`support-chatbot-autonomous-actions`,
  `support-chatbot-human-sla` remain prohibited).
  Paid lockout remains off until `BILLING_ENFORCEMENT_ENABLED` flips.

## Review obligation

Every future phase that changes product capability must update
`src/lib/site/claims.ts` in the same change, then check the copy sources
(`features.ts`, `faq.ts`, `integrations.ts`, page files) for drift.
Marketing accuracy is a production requirement, not a copywriting
preference.

## Adding a claim

1. Add the entry with the strongest sentence the site may publish.
2. Set the honest status; note any unresolved dependency.
3. If marketable, write page copy no stronger than the statement.
4. If planned, keep it off feature pages; roadmap wording only.
5. Run `npm test` (claims tests will catch common violations).
