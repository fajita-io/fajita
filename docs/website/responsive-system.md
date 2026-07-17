# Responsive system (Phase 2)

## Breakpoints tested

1440, 1280, 1024, 768, 430, 390, 360 px in light mode; 1440 and 390 in
dark mode. Automated sweep: `npm run qa:screens` (Playwright, full-page
screenshots, horizontal-overflow and console-error checks across all 21
public routes). Result: 0 px overflow and 0 console errors everywhere
(the 404-probe and prod-blocked Brand Lab log their own 404 status,
which is expected).

## Composition changes, not just stacking

| Surface | Desktop | Mobile |
| --- | --- | --- |
| Header | Inline nav with two dropdowns | Composed full-screen panel, grouped links, stacked CTAs, scroll lock |
| Hero | Copy left, Thermal Stack story right | Copy first, story below with simplified stack (`simplified` prop: two nodes, no alert rail) |
| Problem section | Two timelines side by side | Sequential timelines with preserved contrast labels |
| Coverage explorer | Horizontal tabs beside console | Wrapping tab row above console |
| Product journey | Step rail left, stage right | Step list above stage; touch-size step buttons |
| Comparison table | Full table | Scroll container (`fj-compare-scroll`) with visible edges |
| Auth pages | Split panel + aside | Single panel; aside hidden; tightened block padding |
| Footer | Multi-column | Stacked groups; moment stays playable |

## Type and spacing

Fluid type scale from Phase 1 tokens (`fj-display-*`, `fj-heading-*`)
throughout; no fixed-px headlines. Spacing uses `--space-*` tokens only.

## Interaction

- No hover-dependent functionality; dropdowns are click-driven.
- Touch targets ≥ 44 px on interactive demo controls, nav, and forms.
- Reduced motion: every animation is CSS behind
  `@media (prefers-reduced-motion: reduce)`; demos remain fully
  understandable as static content.
