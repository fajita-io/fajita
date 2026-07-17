# Performance review (Phase 2)

Measurements, techniques, and watch items live in
[`/docs/performance/public-site-budget.md`](../performance/public-site-budget.md).

## Summary

- Production build passes with all public routes statically generated
  (SSG) except the API routes and OG image routes.
- Lighthouse (mobile simulation, production server): performance
  0.90-0.93, accessibility 1.00, best practices 1.00, SEO 1.00 across
  `/`, `/pricing`, and a feature page.
- CLS is 0 on every measured route; TBT ≤ 110 ms.
- LCP element is always the hero headline text; the simulated 3.2-3.3 s
  value is render-blocking-CSS delay under throttling with 0 ms
  estimated savings, i.e. at the practical floor for this architecture.

## Decisions that keep the site fast

1. Server components by default; client JS confined to nav, theme,
   forms, and the three interactive demos.
2. All artwork is hand-built SVG; there are no raster images, videos,
   or canvas/WebGL on any public route.
3. Fonts self-hosted through `next/font` (subset, `display: swap`,
   preloaded); only the weights actually used are shipped.
4. OG images generated at build time from SVG templates; no runtime
   font work.
5. Brand Lab and internal routes are excluded from production bundles.

## Deferred

- Real-user monitoring (field CWV) arrives with the observability
  phase; all numbers above are lab numbers.
- Slow-network manual test was simulated via Lighthouse throttling
  only.
