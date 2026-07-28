# Performance budget

Targets vs. measurements for Fajita. Update via `perceived-performance-engineer`. **Do not invent measurements.**

---

## Core Web Vitals (mobile, public pages)

| Metric | Target (good) | Measured | Date | Route | Status |
| --- | --- | --- | --- | --- | --- |
| LCP | ≤ 2.5s | 3.9s | 2026-07-27 | `/` | Needs improvement (lab; no analytics consent) |
| INP (TBT proxy) | ≤ 200ms | 350ms | 2026-07-27 | `/` | Needs improvement (lab) |
| CLS | ≤ 0.1 | 0 | 2026-07-27 | `/` | Good |

## Core Web Vitals (desktop, public pages)

| Metric | Target (good) | Measured | Date | Route | Status |
| --- | --- | --- | --- | --- | --- |
| LCP | ≤ 2.5s | 3.5–4.9s | 2026-07-27 | `/` | Needs improvement (lab) |
| INP (TBT proxy) | ≤ 200ms | 260–350ms | 2026-07-27 | `/` | Needs improvement (lab) |
| CLS | ≤ 0.1 | 0 | 2026-07-27 | `/` | Good |

### Baseline before 2026-07-27 perf pass (homepage, lab)

| Form factor | LCP | CLS | TBT |
| --- | --- | --- | --- |
| Mobile | 7.6s | 0.416 | 1,050ms |
| Desktop | 8.3s | 0.416 | 680ms |

### Other routes (mobile lab spot check, 2026-07-27)

| Route | LCP | CLS | TBT |
| --- | --- | --- | --- |
| `/pricing` | 4.5–4.9s | 0 | 280–380ms |
| `/docs` | 4.5s | 0 | 280–480ms |
| `/glossary` | 3.5s | 0 | 280ms |
| `/security` | 3.5s | 0 | 390ms |

Align with `pixel-perfect-quality.mdc`.

---

## Initial route payload (targets)

| Asset | Target | Measured | Notes |
| --- | --- | --- | --- |
| HTML (document) | < 50KB compressed | — | Marketing `/` |
| JavaScript (initial) | < 150KB gzip parsed critical path | 229KB shared | Clerk removed from marketing shell; below-fold demos code-split |
| CSS | < 50KB | Route-scoped | Marketing no longer loads `app.css` globally |
| Fonts | ≤ 2 families; subsetted | 3 families | Mono deferred (`preload: false`); display + sans preloaded |
| LCP image | < 100KB WebP/AVIF; preloaded | N/A | Homepage LCP is H1 text |

---

## Runtime expectations (targets)

| Interaction | Target | Measured |
| --- | --- | --- |
| Button acknowledgment | < 100ms perceived | — |
| Route transition (client) | < 300ms perceived | — |
| Search/filter debounced feedback | < 200ms after idle | — |
| API read (p95) | < 500ms TBD | — |
| Monitor create/save (p95) | < 1s TBD | — |
| First check result visible | < 30s with visible progress TBD | — |

---

## Layout stability

| Rule | Target |
| --- | --- |
| CLS per navigation | ≤ 0.1 |
| Skeleton match | Geometry within 4px of final content |
| Image dimensions | width/height or aspect-ratio on all above-fold images |

---

## Animation

| Rule | Target |
| --- | --- |
| Frame rate | 60fps on interaction animations |
| Reduced motion | Instant state change or opacity only |

---

## Mobile constraints

| Rule | Target |
| --- | --- |
| Touch response | INP ≤ 200ms |
| Payload on 3G spot check | Usable LCP < 4s aspirational |

---

## AI operations

| Stage | Feedback requirement |
| --- | --- |
| Request sent | Immediate ack within 100ms |
| Processing | Indeterminate progress or streamed tokens |
| Failure | Preserved input; retry safe |
| Complete | Clear completion + next step |

`[UNRESOLVED]` until AI features ship.

---

## 2026-07-27 polish pass

- Consent-gated analytics: GA and DataFast load only after explicit accept-all
- Server-rendered marketing header shell (`SiteHeaderContent` + tiny client islands)
- Removed third-party dns-prefetch hints until consent grants analytics
- Cookie banner dispatches consent updates; safe-area inset on mobile
- Footer moment restored to SSR to eliminate mobile CLS regression

## 2026-07-27 optimizations shipped

- Route-scoped CSS (marketing no longer pulls `app.css`, docs CSS, glossary CSS on `/`)
- `ClerkProvider` moved to auth/app/onboarding/affiliate layouts only
- Analytics scripts deferred (`lazyOnload`)
- Font fallback tuning (`adjustFontFallback`, mono `preload: false`)
- Footer CLS fixes (opacity-only finale animation, reserved finale height, footer `contain`)
- Product Hunt banner SSR-visible when configured (no post-hydration insert)
- Below-fold homepage demos code-split with reserved geometry
- Support chat CSS loaded with lazy Ask Fajita bundle
- Preconnect resource hints for fonts and analytics origins

## Remaining gaps for “good” CWV everywhere

- Homepage/mobile LCP still font- and CSS-bound in lab (H1 display face)
- Consent-gated GA/DataFast would remove third-party main-thread work on first visit
- Re-verify on production Vercel URL with PageSpeed Insights (CDN + HTTP/3)
- Pricing/docs routes inherit heavy `SiteHeader` client bundle; consider static nav shell

---

*Record measurements after `perceived-performance-engineer` or `layout-perfection-critic` audits.*
