# Status page performance budget

Public status pages must be extremely fast. The renderer ships no auth bundle, no marketing animation bundle, no chatbot, and no heavy analytics.

## Targets (public page, mobile)

| Metric | Target |
| --- | --- |
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| Client JS on public page | Minimal (server components; no client state machine) |
| Core content without JS | Fully rendered (server HTML) |

## Techniques in place

- Server-rendered from a pre-built snapshot; no per-request dashboard queries.
- ISR caching (`revalidate` 30s pages / 60s archive) plus CDN.
- Own stylesheet only; themes via CSS variables (no runtime theme JS).
- Bounded/paginated incident archive; uptime history lazy where large.
- Image dimensions reserved; no lazy-loading of the LCP element.

## Management app

Paginated incident archive, bounded history queries, no N+1 monitor queries in the overview (`getStatusPageOverview` uses batched queries), efficient domain-verification polling (manual, rate-limited).

## Measurement status

Targets are set. Live field measurements (Lighthouse/PSI on deployed public pages) and the executed load test below are deferred to a staging environment with the CDN in front; results go in `docs/testing/phase-8-load-results.md`. No measured numbers are fabricated here.
