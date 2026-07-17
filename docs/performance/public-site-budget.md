# Public site performance budget and measurements (Phase 2)

## Budget

| Metric | Target | Notes |
| --- | --- | --- |
| First Load JS per route | ≤ 130 kB | Shared baseline ~102 kB |
| LCP (mobile, field) | ≤ 2.5 s | Lighthouse simulated slow-4G will read higher |
| CLS | ≤ 0.1 | Aim for 0 |
| TBT / INP proxy | ≤ 200 ms | |
| Route-level images | SVG-first, no raster hero | |

## Measured (2026-07-16, production build, `next start`, Lighthouse 12 mobile simulation)

| Route | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 0.90 | 1.00 | 1.00 | 1.00 | 3.3 s | 0 | 80 ms |
| `/pricing` | 0.93 | 1.00 | 1.00 | 1.00 | 3.2 s | 0 | 70 ms |
| `/features/uptime-monitoring` | 0.93 | 1.00 | 1.00 | 1.00 | 3.2 s | 0 | 110 ms |

LCP element is the hero H1 text in every case; the 3.2-3.3 s simulated
value is 86% render delay from render-blocking CSS under 4x CPU / slow-4G
throttling (est. savings audit: 0 ms). Unthrottled and on realistic
field connections the text paints well under 2.5 s. No image or font is
on the LCP path (fonts are self-hosted via `next/font` with swap).

## Bundle (from `next build`)

| Route | Route JS | First Load JS |
| --- | --- | --- |
| `/` | 5.44 kB | 118 kB |
| `/pricing` | 1.15 kB | 107 kB |
| `/features/[slug]` | 1.28 kB | 110 kB |
| Static content pages | ≤ 1 kB | 103-107 kB |
| Shared baseline | | 102 kB |

## Techniques in place

- Server components for all static content; client components confined
  to the interactive demos, nav, forms, and theme toggle.
- All product visuals are SVG (Thermal Stack, alert flow, charts); no
  video, no raster screenshots, no WebGL.
- CSS animation only; `prefers-reduced-motion` disables non-essential
  motion globally.
- Brand Lab excluded from production (dev-only route).
- OG images pre-generated at build time (no runtime font loading).
- Zero CLS: no unsized media, no late-inserted banners.

## Watch items

- Homepage First Load JS (118 kB) is the ceiling-setter; keep new
  homepage client components out unless they earn it.
- Re-measure after security headers land and after any font change.
