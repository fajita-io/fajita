# Public site strategy (Phase 2)

## What this site is

The complete public marketing surface for Fajita: a lightweight
uptime-monitoring SaaS for founders, developers, agencies, and small
software teams. The site launches before the product does, so its honest
job is to explain the product, prove the thinking, and collect early
access signups. Nothing on the site claims to be live before it is.

## Positioning

- Category: uptime monitoring and customer-facing incident communication.
- Primary line: "Know when your software gets too hot."
- Support: "Fajita monitors your websites, APIs, certificates, and cron
  jobs. When something starts cooking, your team hears about it before
  your customers do."
- Counter-positioning: focused monitoring, not an observability suite.
  No agent, no log pipeline, no dashboard maze.

## Launch state and CTA strategy

Accounts are not open (`accountsOpen: false` in
`src/lib/site/site-config.ts`). Every primary CTA reads "Get early
access" and routes to `/signup`, which stores the address in Supabase.
When accounts open, flipping `accountsOpen` switches the label to "Start
monitoring" sitewide. No page implies a visitor can create a live
monitor today; the demo says "Simulation. No account, no requests leave
this page."

## Honesty architecture

Three systems keep marketing accurate:

1. **Claims registry** (`src/lib/site/claims.ts`): every capability the
   site may mention, with status (`available-now`, `at-launch`,
   `planned`, `internal-only`). Tests enforce that planned capabilities
   are not marketable.
2. **Centralized pricing** (`src/lib/site/pricing.ts`): plan identity
   mirrors `src/lib/stripe/plans.ts` (import-checked by tests); dollar
   amounts are null until the billing gate passes.
3. **Truthful status route** (`/status`): explains why it will not show
   a fake green banner; replaced by dogfooded live monitoring in Phase 8.

## Per-route conversion objectives

| Route | Primary objective |
| --- | --- |
| `/` | Early access signup |
| `/pricing` | Early access signup (plan intent captured via goal metadata) |
| `/features`, `/features/*` | Early access signup |
| `/integrations` | Understand compatibility, then signup |
| `/security` | Build trust, return to signup |
| `/about` | Credibility, return to product |
| `/contact` | Submit inquiry |
| `/changelog`, `/roadmap` | Return visits and trust |
| `/signup` | Store early access email |
| `/login` | Honest redirect of intent to early access |

## What is intentionally hidden

Blog, docs, glossary, comparison pages, free tools, and the affiliate
program have no links anywhere. They ship in later phases with real
content. The Pamphlet chat mount point is documented in
`src/components/site/site-footer.tsx` but renders nothing.
