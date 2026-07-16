---
name: layout-perfection-critic
description: >-
  Audit and fix broken markdown, spacing drift, layout defects, and Core Web
  Vitals for Fajita. Run before shipping CSS, markdown, or page changes.
  Screenshot and Lighthouse evidence required.
---

# Layout perfection critic

## Purpose

Catch and fix broken markdown, sloppy spacing, responsive defects, and Core Web Vitals regressions before ship. Complements `visual-qa-critic` (creative direction) with **technical layout and performance precision**.

## When to invoke

- Automatically before marking any CSS, layout, markdown, or page work done (per `pixel-perfect-quality.mdc`)
- After implementing docs, legal, blog, or MDX content
- When user reports overflow, misalignment, or "looks off on mobile"
- Phase 11 production hardening in `DESIGN_WORKFLOW.md`
- After `responsive-art-director` if spacing or markdown issues remain

**Pair with** `visual-qa-critic` on major launches: creative scores first, then this skill for precision and CWV.

## Required inputs

- Changed routes and files (git diff or task scope)
- Running dev server or preview URL
- List of markdown-bearing surfaces (docs, legal, blog, in-app)
- Design spacing tokens (CSS variables, Tailwind theme) if defined
- `pixel-perfect-quality.mdc` thresholds

## Step-by-step workflow

### 1. Inventory surfaces

List every route and component touched. Flag:

- Markdown/MDX renderers
- Global layout (header, footer, main padding)
- Shared components (cards, buttons, forms, tables)
- New images, fonts, or scripts (CWV risk)

### 2. Markdown audit

For each markdown surface, verify in the **browser** (not only source):

- [ ] Headings render with correct hierarchy and spacing
- [ ] Lists and nested lists align and indent correctly
- [ ] Links work; styling distinct; touch-friendly on mobile
- [ ] Inline and block code readable; blocks scroll internally
- [ ] Tables do not blow out viewport (scroll wrapper if needed)
- [ ] Images constrained; alt present
- [ ] No raw markdown visible
- [ ] Prose styles use shared component/class

Fix content or renderer in same session.

### 3. Spacing and CSS audit

At 1440px and 390px (minimum), screenshot and inspect:

- [ ] Section padding consistent with design scale
- [ ] Same component types share padding/gap values
- [ ] No accidental magic-number spacing (`13px`, `17px`…) unless documented
- [ ] Icons aligned to text baseline or center per spec
- [ ] No overlapping text, buttons, or sticky chrome
- [ ] No horizontal scroll at 360px
- [ ] Border radius and shadows consistent with tokens
- [ ] Focus rings visible and not clipped

Compare sibling pages: if one card uses `p-6` and another `p-5` without reason, fix.

### 4. Responsive pass

Quick pass at 1024, 768, 430, 360 if not already covered by `responsive-art-director`:

- [ ] CTAs and inputs usable
- [ ] Markdown tables and code blocks usable on narrow screens
- [ ] Nav and footer do not crush content

### 5. Core Web Vitals measurement

On **changed public routes**, run Lighthouse (mobile) or PageSpeed Insights:

| Metric | Pass |
| --- | --- |
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |

Record scores. If fail:

1. Identify element (LCP image, font, shifting banner, heavy JS)
2. Fix (dimensions, preload, reduce JS, reserve space)
3. Re-measure until pass or document exception

Authenticated app routes: spot-check INP and CLS; LCP less critical unless marketing shell.

### 6. Console and hydration

- [ ] No new console errors
- [ ] No hydration mismatch warnings
- [ ] No layout thrashing from animations

### 7. Log and fix loop

Log issues in `critique-log.md` under category `Layout`, `Markdown`, or `CWV`. Fix highest severity first. Re-run audit until pass gates met.

## Required outputs

- **Audit report** (surfaces checked, pass/fail per category)
- **Markdown issues list** with fixes
- **Spacing drift list** with token corrections
- **CWV scores** (mobile) for changed public URLs
- **Screenshot refs** for defects found and fixed
- **Ship recommendation** (pass / pass with documented exception / fail)

## Quality gates

- [ ] Zero broken markdown on customer-facing surfaces
- [ ] No horizontal overflow at 360px on changed routes
- [ ] Spacing uses design tokens; drift resolved
- [ ] Mobile and desktop screenshots inspected (not only generated)
- [ ] CWV in "good" range on changed public pages or exception documented
- [ ] `critique-log.md` updated when issues found

## Failure conditions

- Approving without browser inspection
- Ignoring CWV "poor" on homepage or key landing pages
- Leaving raw markdown visible
- One-off spacing hacks instead of token fixes
- Skipping markdown surfaces because "it's just docs"

## Design memory updates

| File | What to write |
| --- | --- |
| `critique-log.md` | Layout, Markdown, CWV entries with severity and resolution |
| `visual-decisions.md` | New spacing exceptions or prose component decisions |

## Auto-run

Do not wait for the user to say "check CWV" or "fix markdown." Run this skill automatically per `pixel-perfect-quality.mdc` whenever layout, CSS, or markdown changes ship.

Cross-reference: `pixel-perfect-quality.mdc`, `frontend-quality.mdc`, `responsive-art-director`, `visual-qa-critic`.
