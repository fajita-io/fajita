# Performance budget

Targets vs. measurements for Fajita. Update via `perceived-performance-engineer`. **Do not invent measurements.**

---

## Core Web Vitals (mobile, public pages)

| Metric | Target (good) | Measured | Date | Route | Status |
| --- | --- | --- | --- | --- | --- |
| LCP | ≤ 2.5s | — | — | `/` | Not measured |
| INP | ≤ 200ms | — | — | `/` | Not measured |
| CLS | ≤ 0.1 | — | — | `/` | Not measured |

Align with `pixel-perfect-quality.mdc`.

---

## Initial route payload (targets)

| Asset | Target | Measured | Notes |
| --- | --- | --- | --- |
| HTML (document) | < 50KB compressed | — | Marketing `/` |
| JavaScript (initial) | < 150KB gzip parsed critical path | — | Minimize client components on marketing |
| CSS | < 50KB | — | |
| Fonts | ≤ 2 families; subsetted | — | |
| LCP image | < 100KB WebP/AVIF; preloaded | — | When hero image exists |

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

*Record measurements after `perceived-performance-engineer` or `layout-perfection-critic` audits.*
