# Phase 2 handoff: public marketing site

Status: complete. Production build, typecheck, lint, and the full test
suite pass. This document tells Phase 3+ (and any future owner) how the
public site is put together and how to change it safely.

## What exists

21 public routes under `src/app/(site)/` sharing one layout
(header, footer, skip link):

```text
/            /pricing      /features            /features/[slug] x6
/integrations /security    /about               /contact
/changelog    /roadmap     /status              /login (noindex)
/signup       /legal
```

Plus root-level `not-found.tsx` (404), `error.tsx` (500 boundary),
`(site)/loading.tsx`, `sitemap.ts`, `robots`, `llms.txt`, and per-route
`opengraph-image.tsx` files.

## Where the copy lives (single most important fact)

All product-truth content is typed data in `src/lib/site/`, not
scattered through JSX:

| File | Owns |
| --- | --- |
| `site-config.ts` | Site URL, nav, contact topics, `accountsOpen` flag |
| `pricing.ts` | Plans, limits, comparison rows, `published: false` gate |
| `claims.ts` | Public claims registry (status: at-launch / planned / internal) |
| `features.ts` | Feature hub + all six feature-page contents |
| `integrations.ts` | Launch channels (email, Slack, Discord, webhook) |
| `faq.ts` | `homeFaq`, `billingFaq` |
| `changelog.ts`, `roadmap.ts`, `legal.ts` | Their pages' entries |
| `metadata.ts` | `buildMetadata()` helper every page uses |

A non-engineer can edit copy by editing these files. Tests in
`tests/site-content.test.ts` enforce: no em dashes, no banned words, no
lorem ipsum, no claims marketed beyond their registry status, pricing
centralized with no published dollar amounts.

## Key switches for later phases

- **`accountsOpen` in `site-config.ts`** is `false`. All "Start
  monitoring" CTAs currently route to `/signup`, which is an
  early-access waitlist form. When auth ships (Clerk), flip the flag
  and rework `/signup` and `/login`; CTA labels update centrally.
- **`pricing.published`** is `false`; the pricing page shows plans,
  limits, and comparison without dollar amounts. Set real prices here
  and in Stripe together (see `billing-and-entitlements.mdc`).
- **`/status`** is a truthful placeholder that explicitly says live
  monitoring is not yet published. Phase 8 replaces it with the real
  status system; do not hardcode "all systems operational".
- **Pamphlet chatbot**: no mount exists in the DOM; the footer has a
  documented slot comment. Do not ship attribution before the widget.

## Interactive demos (all simulation, zero network)

- `home/hero-narrative.tsx`: Thermal Stack monitoring story (detect,
  verify, alert, recover), CSS-driven, `simplified` prop for mobile.
- `home/coverage-explorer.tsx`: monitor-type tabs with a shared
  console; keyboard tab pattern.
- `home/product-journey.tsx`: nine-step hands-on demo (add monitor
  through uptime review). Local state only; no fetches, no backend
  writes, no user-URL handling, reset supported. Tested end-to-end in
  `tests/site-demo.test.tsx`.
- `status-page-preview.tsx`, `alert-flow.tsx`, `monitor-preview.tsx`,
  `feature-demo.tsx`: reusable marketing simulations Phase 8 can
  reference visually but must not import into product logic.

## Backend surface (intentionally small)

- `POST /api/early-access`: waitlist signup. Validation, honeypot
  (`company` field), in-memory rate limit (5/min/IP), Supabase insert
  with `onConflict: email`.
- `POST /api/contact`: contact form. Same protections (3/min/IP),
  topic validated against `site-config.ts`.
- Supabase tables `early_access_signups` and `contact_messages`
  (migrations `20260716230000` and `20260716234500`), RLS enabled, no
  policies (service-role access only via `src/lib/supabase/admin-rest.ts`).
- No email delivery yet: submissions land in the tables. The
  lifecycle-communications phase wires notifications.
- Rate limiting is in-memory and per-instance; fine for launch traffic
  on one region, revisit if serverless concurrency grows.

## SEO and assets

- Every route: unique title/description/canonical via
  `buildMetadata()`; JSON-LD (Organization + WebSite in layout,
  page types where warranted); sitemap covers all indexable routes;
  `/login`, API, and internal routes are noindex/disallowed.
- OG images: `scripts/generate-og-pages.ts` typesets per-page SVG
  templates (Fraunces + Instrument Sans via fontkit) into
  `public/brand/social/pages/`; `src/lib/site/og.tsx` renders them
  through `ImageResponse`. Add a page = add a template entry + an
  `opengraph-image.tsx`.
- `llms.txt` describes the product and key URLs; update it when
  positioning or routes change.

## Analytics

DataFast goals in `src/lib/analytics/goals.ts`; declarative
`data-fast-goal` attributes on CTAs (never paired with onClick
tracking; that double-fires). Server goals fire from the two API
routes. Event catalog: `docs/analytics/public-site-events.md`.
Client components must import from `@/lib/analytics/client` and
`@/lib/analytics/goals` directly, not the barrel (it pulls in
`server-only`).

## Testing and QA commands

```bash
npm run typecheck && npm run lint && npm test   # unit/content/SEO suites
npm run build                                    # production build
npm run qa:screens                               # screenshot sweep, overflow + console checks
```

Reviews: `docs/website/visual-qa.md`,
`docs/website/accessibility-review.md`,
`docs/performance/public-site-budget.md`.

## Intentionally hidden / deferred

Docs, blog, glossary, comparison pages, free tools, affiliate program:
no links anywhere on the site until those systems exist. Legal
documents are listed on `/legal` as "Publishes at launch"; no draft
text is published or indexed.

## Explicitly not built (per phase boundaries)

Authenticated app, monitoring engine, incident processing, real
notification integrations, real status-page system, Stripe checkout,
affiliate tracking, documentation center, blog, Pamphlet chatbot,
lifecycle email automation, admin console.

## Open human decisions for Phase 3+

1. Final dollar pricing (then flip `pricing.published`).
2. Multi-region verification wording: currently future-facing
   ("confirms from a second location before alerting" is registered as
   at-launch; verify the engine ships it or soften before launch).
3. Sender domain and provider for contact/waitlist notifications.
4. Whether `/login` remains noindex after auth ships.
