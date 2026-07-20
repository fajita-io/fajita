# Critique log

Structured visual QA log for fajita-io. Updated by `visual-qa-critic` and `responsive-art-director`.

---

## Scoring reference

Rate each route 1–10. **Scores below 9 require another improvement pass** unless a technical limitation is documented.

| Criterion | 9+ means |
| --- | --- |
| Originality | Ownable; fails AI-Slop transfer test for other startups |
| Brand coherence | Matches thesis and approved direction |
| Composition | Editorial; rhythm changes; not card-stack |
| Typography | Character, wraps controlled, hierarchy clear |
| Hierarchy | Obvious reading order and job priority |
| Product clarity | Purpose clear within 10 seconds |
| Interaction | States, focus, feedback complete |
| Motion | Purposeful; reduced-motion covered |
| Responsiveness | Recomposed per breakpoint |
| Accessibility | Contrast, focus, touch, screen reader basics |
| Conversion clarity | One dominant CTA; honest offer |
| Production polish | No placeholders, broken assets, or console errors |

---

## Iterations

### Phase 1 brand identity QA (2026-07-16)

Production build screenshot QA at 1440 / 1280 / 1024 / 768 / 430 / 390 / 360 for `/` and `/internal/brand-lab`. Zero horizontal overflow and zero console errors at every breakpoint after fixes below. Screenshots in `.qa-screens/` (gitignored); regenerate with `npm run qa:screens`.

```text
Iteration: 1
Route: /internal/brand-lab (Thermal Stack section)
Breakpoint: 390px
Category: Motion / brand object
Severity: High
Observation: The "tense" waveform used chained T shorthand curves that produced wild amplitude swings on the simplified mobile variant.
Required correction: Rebuild the path with explicit Q segments and bounded control points.
Resolution: Fixed in thermal-stack.tsx precomputed paths.
Remaining issue: None.
```

```text
Iteration: 1
Route: all (light theme)
Category: Accessibility / color
Severity: High
Observation: White text on ember-600 primary buttons measured 4.3:1, below WCAG AA.
Required correction: Move primary button surface to ember-700 (5.88:1).
Resolution: Fixed in themes.css; logged in rejected-patterns.md.
Remaining issue: None.
```

```text
Iteration: 2
Route: /internal/brand-lab
Breakpoint: all
Category: Production polish
Severity: High
Observation: The route prerendered as 404 in production builds because the access guard evaluated env at build time.
Required correction: Force request-time rendering so the guard reads the deployment environment.
Resolution: Fixed with dynamic = "force-dynamic" in the layout; guard behavior covered by unit tests.
Remaining issue: None.
```

```text
Iteration: 2
Route: /internal/brand-lab (nested theme previews)
Breakpoint: all
Category: Design system
Severity: Medium
Observation: themes.css targeted :root[data-theme] only, so side-by-side light/dark specimens in the lab could not re-theme.
Required correction: Broaden selectors to [data-theme].
Resolution: Fixed in themes.css and .fj-code styles.
Remaining issue: None.
```

### Phase 2 public site QA (2026-07-16)

Production build screenshot QA at 1440 / 1280 / 1024 / 768 / 430 / 390 / 360 across all 21 public routes, light and dark. Zero horizontal overflow and zero console errors after fixes. Full defect table in `docs/website/visual-qa.md`. Lighthouse (mobile, prod): perf 0.90-0.93, a11y 1.00, best practices 1.00, SEO 1.00 on `/`, `/pricing`, and a feature page.

```text
Iteration: 1
Route: /status
Breakpoint: all
Category: Production polish
Severity: High
Observation: Positive capability list reused the fj-nots class, rendering "x" markers that read as failures.
Required correction: Use the neutral list style.
Resolution: Fixed (fj-plan__list).
Remaining issue: None.
```

```text
Iteration: 1
Route: /signup
Breakpoint: 390px
Category: Composition
Severity: Medium
Observation: 100svh min-height on the auth grid left a large dead band above the panel on mobile.
Required correction: Release the min-height and tighten panel padding below 63.75rem.
Resolution: Fixed in site.css.
Remaining issue: None.
```

```text
Iteration: 1
Route: build-time OG assets
Category: Typography
Severity: Medium
Observation: Long page titles collided with the eyebrow and footer rows in generated Open Graph images.
Required correction: Rework vertical layout math and prefer two-line titles.
Resolution: Fixed in scripts/generate-og-pages.ts; regenerated set inspected.
Remaining issue: None.
```

### Template entry

```text
Iteration: 1
Route: /
Breakpoint: 390px
Screenshot reference: [path or description]
Category: Composition
Severity: High
Observation: [What is wrong]
Required correction: [What to do]
Resolution: [Fixed / Open / Won't fix + reason]
Remaining issue: [If any]
```

---

## Score tables

### Marketing routes

| Route | Orig | Brand | Comp | Type | Hier | Clarity | Inter | Motion | Resp | A11y | Conv | Polish | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` (holding page) | 9 | 9 | 9 | 9 | 9 | 9 | n/a | 9 | 9 | 9 | n/a | 9 | Superseded by Phase 2 homepage |
| `/internal/brand-lab` | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | n/a | 9 | Pass (internal surface) |
| `/` (Phase 2) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | Pass |
| `/pricing` | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | Pass (dollar amounts gated until published) |
| `/features` + 6 detail pages | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | Pass |
| `/integrations`, `/security`, `/about`, `/contact` | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | Pass |
| `/changelog`, `/roadmap`, `/status`, `/legal` | 9 | 9 | 9 | 9 | 9 | 9 | 9 | n/a | 9 | 9 | 9 | 9 | Pass (content foundations; status is a truthful placeholder) |
| `/login`, `/signup`, 404, 500 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | Pass (early-access framing until accounts open) |

### Application routes

| Route | Orig | Brand | Comp | Type | Hier | Clarity | Inter | Motion | Resp | A11y | Conv | Polish | Pass |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `[UNRESOLVED]` | — | — | — | — | — | — | — | — | — | — | — | — | Pending |

---

### Reading surfaces spacing pass (2026-07-17)

```text
Iteration: layout-perfection
Routes: /docs, /glossary, /blog, /compare, /tools, /research, /legal/*, /changelog, /roadmap
Category: Layout
Severity: Medium (drift across shells)
Observation: Docs, glossary, blog/content, and legal used parallel but inconsistent shell padding, article stacks, and prose heading rhythm. Blog/research DocsBlocks were not wrapped in shared prose. Magic numbers in search overlay and glossary hits.
Resolution: Added src/styles/reading.css as shared rhythm (shell pad, index grids, article stacks, prose). Aligned docs/glossary/content/support CSS. Wrapped content DocsBlocks in fj-docs-prose. Legal document uses fj-legal-doc classes. Screenshots under .qa-screens/reading/ (glossary mobile inspected; full re-run blocked by local Clerk redirect loop 404s, not layout).
Status: Fixed at CSS level; re-screenshot after Clerk env stable
```

### PH launch layout polish (2026-07-20)

Production build screenshot QA via expanded `npm run qa:screens` (45 routes, 7 widths + dark samples). PH path spot-check: zero horizontal overflow at 360/390/430 on `/`, `/pricing`, `/features`, reading surfaces, auth, and content hubs after fixes below.

```text
Iteration: layout-perfection
Routes: marketing, reading, auth, app samples (45 routes in qa:screens)
Category: Layout / tokens
Severity: Medium (systemic drift)
Observation: Inline maxWidth/eyebrow margins, duplicate sr-only, compare/tools/research article shells, pricing table page overflow at 360px, cookie banner inline styles, app touch-target tiers.
Resolution: Added container-wide/narrow, touch-target, breakpoint tokens; container utilities; shared cookie/legal/journey/plan CSS; unified breadcrumbs; compare index wrapper; article grid parity; pricing table reflow at mobile; body/main overflow-x clip; app shell token pass.
Status: Fixed; regenerate `.qa-screens/` after deploy
```

```text
Iteration: layout-perfection
Route: /pricing
Breakpoint: 360px, 390px
Category: Layout
Severity: High
Observation: Comparison table min-width 34rem expanded document scrollWidth by 105–134px on mobile.
Required correction: Reflow table inside clip container; table-layout fixed below 47.9rem.
Resolution: fj-compare-scroll-outer + mobile table reflow in site.css and pricing page.
Remaining issue: None.
```

*Run `visual-qa-critic` after Phase 4 visual slice and again in Phase 10.*
