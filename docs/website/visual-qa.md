# Visual QA log (Phase 2 + PH polish)

## Method

- Automated sweep: `npm run qa:screens` (Playwright,
  `scripts/screenshot-qa.ts`) captures full-page screenshots at 1440, 1280, 1024, 768, 430, 390, and 360 px, checks
  for horizontal overflow, and records console errors. Output lands in
  `.qa-screens/` (gitignored).
- Dark-mode captures at 1440 and 390 px.
- Human review of the captures, plus interactive passes in a real
  browser for the demos, navigation, and forms on the production build
  (`next build` + `next start`).

## Route coverage (2026-07-20)

**45 routes** in `scripts/screenshot-qa.ts`:

- Core marketing (home, pricing, features + 6 detail, integrations + 2 detail, security, about, contact, support, affiliates + apply, changelog, roadmap, status, early-access, login, signup, legal + 3 policies, 404)
- Reading samples (docs hub + first monitor guide, glossary hub + category + term, blog hub + article, compare hub + page, tools hub + uptime calculator, research hub)
- App samples (dashboard, onboarding, monitors, monitors/new, incidents, billing) unauthenticated redirect check
- Internal: brand-lab

Template fixes in shared CSS propagate to 280+ sitemap URLs without per-page screenshots.

## Final sweep result (2026-07-20 PH polish)

- Horizontal overflow: **0** on PH path spot-check (`/`, `/pricing`, `/features`, `/signup`, docs/glossary/blog/compare/tools samples) at 360–430px after pricing table reflow fix.
- Pricing comparison table: reflows with `table-layout: fixed` below 768px; no document-level horizontal scroll.
- Console: CSP blob-worker warnings from Sentry/Clerk in local Playwright runs; not layout regressions. Re-verify on production domain without dev CSP noise.

## Prior sweep (2026-07-16)

- Horizontal overflow: 0 routes at all 7 widths (21 routes).
- Console errors: 0 (the intentional 404 probe and the prod-blocked
  Brand Lab report their status codes as expected).
- Hydration warnings: none in dev or production runs.

## Defects found and fixed during PH polish (2026-07-20)

| Defect | Route / area | Fix |
| --- | --- | --- |
| Inline eyebrow/container maxWidth drift | 12+ marketing pages | `fj-page-hero__eyebrow`, `fj-container--wide/narrow` |
| Cookie banner inline layout | all marketing | `.fj-cookie-consent*` in components.css |
| Compare index missing shell stack | `/compare` | `fj-content-index` wrapper |
| Compare/tools/research article shell | content routes | `fj-content-article` + `__body` grid |
| Duplicate `.fj-sr-only` | glossary, content CSS | Moved to components.css |
| Breadcrumb separator drift | content vs docs | Unified `li + li::before` pattern |
| Pricing table mobile overflow | `/pricing` | `fj-compare-scroll-outer`, mobile table reflow |
| App/onboarding inline maxWidth | `/app/onboarding` | `.fj-app-narrow` |
| Touch-target magic numbers | site, support, app, components | `--touch-target-*` tokens |

## Judgments recorded

- Mobile hero: simplified Thermal Stack (two nodes, no alert rail)
  reads clearly at 360 px; full stack was too dense below 768 px.
- Comparison table on `/pricing`: below 768 px uses fixed layout reflow
  inside a clip container; columns remain comparable without page-level scroll.
- Dark mode: all status hues pass contrast on the carbon background;
  no adjustments needed beyond Phase 1 tokens.

## Not covered (deferred)

- Real-device Safari/Firefox passes were spot checks only; full
  cross-browser matrix belongs to the release-hardening phase.
- Localization-length stress used long English strings, not
  translations.
- Lighthouse mobile scores: run on production deploy (CLI not in local CI).
