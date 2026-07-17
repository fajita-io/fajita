# Visual QA log (Phase 2)

## Method

- Automated sweep: `npm run qa:screens` (Playwright,
  `scripts/screenshot-qa.ts`) captures full-page screenshots of all 21
  public routes at 1440, 1280, 1024, 768, 430, 390, and 360 px, checks
  for horizontal overflow, and records console errors. Output lands in
  `.qa-screens/` (gitignored).
- Dark-mode captures at 1440 and 390 px.
- Human review of the captures, plus interactive passes in a real
  browser for the demos, navigation, and forms on the production build
  (`next build` + `next start`).

## Final sweep result (2026-07-16)

- Horizontal overflow: 0 routes at all 7 widths.
- Console errors: 0 (the intentional 404 probe and the prod-blocked
  Brand Lab report their status codes as expected).
- Hydration warnings: none in dev or production runs.

## Defects found and fixed during the phase

| Defect | Route | Fix |
| --- | --- | --- |
| Status page list rendered with "x" markers (misused `fj-nots` class meant for negative lists) | `/status` | Switched list to `fj-plan__list` |
| Large empty band above the signup panel on mobile (grid held `100svh` min-height) | `/signup` | Media query at 63.75rem: `min-height: 0` on `.fj-auth`, tightened panel padding |
| Login/signup "See how it works" linked to a non-existent `#product-journey` anchor | `/login`, `/signup` | Point to `/#how-it-works` |
| OG templates: long titles collided with eyebrow/footer rows | build-time assets | Reworked layout math in `scripts/generate-og-pages.ts`; prefer two-line titles |
| Dangling `aria-labelledby` ids on homepage sections | `/` | Removed the attributes; headings carry the structure |
| Double analytics fire on CTAs (`data-fast-goal` + onClick) | several | Removed onClick handlers; declarative attribute only |

## Judgments recorded

- Mobile hero: simplified Thermal Stack (two nodes, no alert rail)
  reads clearly at 360 px; full stack was too dense below 768 px.
- Comparison table on `/pricing` uses an edge-visible scroll container
  below 768 px rather than a reflowed card list; column comparison is
  the point of the table.
- Dark mode: all status hues pass contrast on the carbon background;
  no adjustments needed beyond Phase 1 tokens.

## Not covered (deferred)

- Real-device Safari/Firefox passes were spot checks only; full
  cross-browser matrix belongs to the release-hardening phase.
- Localization-length stress used long English strings, not
  translations.
