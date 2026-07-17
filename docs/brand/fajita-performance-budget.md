# Fajita brand performance budget

Version 1.0 · Phase 1

Visual ambition may not slow the product. These budgets bind every later phase; the experience-level budget lives in `.cursor/experience-memory/performance-budget.md`.

## Budgets

| Asset class | Budget | Phase 1 status |
| --- | --- | --- |
| Fonts | 3 variable font files (display, sans, mono), latin subset, ~220KB total, `font-display: swap` | Met: next/font self-hosts subsets; no static weight files |
| Brand CSS (tokens + themes + typography + motion + components) | <= 20KB raw | Met: ~17KB raw, minifies well |
| Logo components | Zero runtime dependencies; wordmark path data ~8KB JSON | Met |
| Thermal Stack | Server-rendered SVG ~4KB; zero JS unless controller used; CSS-only animation | Met |
| Animation libraries | None (CSS only) | Met: no Framer Motion/GSAP/Lottie |
| Hero/social images | SVG-first; OG PNG generated server-side; no raster in the page payload | Met |
| Initial JS on public routes | No brand component may force a client boundary on a static page | Met: only ThemeToggle/controller are client components, both opt-in |
| Layout shift from brand assets | 0 (all SVGs have width/height or viewBox-derived dimensions) | Met |
| Interaction latency | Feedback within 140ms token; no animation blocking input | Met |

## Enforced practices

- Pre-paint theme script is inline and tiny (<400 bytes); no theme flash, no reflow
- SVG complexity capped: no filter chains, no embedded rasters, no editor metadata (logo requirement)
- Brand Lab is dev-only (`notFound()` in production without explicit flag) so its weight never ships to customers
- Max 3 simultaneous infinite animations per viewport; complex narrative components lazy-load below the fold
- `prefers-reduced-motion` removes animation cost entirely for those users
- Static fallbacks exist for every animated component (server-renderable)

## Core Web Vitals targets (from `pixel-perfect-quality.mdc`)

LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 on mobile. Phase 1 surfaces (holding page) are static SSG with system-hosted fonts and no blocking scripts beyond analytics. Measure on real routes each phase; record in `performance-budget.md` (experience memory). Do not invent measurements.

## Decisions log

- **No WebGL/canvas for the Thermal Stack.** CSS/SVG achieves the narrative at a fraction of the cost; revisit only for a hero experience that demonstrably needs it.
- **Outlined wordmark instead of live display font in the logo:** removes render dependency and guarantees identical rendering everywhere for ~8KB of path data.
- **SVG-first public assets** with generated PNG only where platforms require raster.
