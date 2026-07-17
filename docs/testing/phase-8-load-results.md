# Phase 8 load test results

## Status: deferred (requires deployed staging + CDN)

Load testing the public renderer meaningfully requires the production hosting/CDN path in front of the origin. That environment is operated by the hosting platform and is not exercised from this repository. No load numbers are fabricated here.

## Planned scenarios

100 / 1,000 / 5,000 status pages; traffic spike during an incident; spike on one customer page; platform-wide incident burst; cache-invalidation burst; custom-domain traffic; badge traffic; public API traffic; incident-archive browsing; maintenance-publication burst.

## Planned measurements

CDN hit ratio, origin requests, projection-read latency, cache-invalidation throughput, public render latency, database load, domain routing, TLS provisioning queue, error rate, memory, CPU.

## Design properties that support the targets

- Public pages render from a pre-built snapshot, not live dashboard queries, so origin load per request is bounded.
- ISR + CDN absorb read spikes; invalidation is per-slug, not platform-wide.
- Minimal client JS keeps client cost low.
- Management routes paginate and use batched queries (no N+1).

When executed, record real numbers here with date, environment, and tool.
