# Status page badges

## Endpoint

`GET /status/[slug]/badge` (`src/app/(status)/status/[slug]/badge/route.ts`) returns an SVG badge of the current overall state.

## Properties

- **Static SVG.** No JavaScript required to embed. `<img src="https://<page>/badge">`.
- **Cacheable.** ISR-backed with CDN caching.
- **Rate limited.** Uses the shared `rateLimit` by client key so the badge cannot become an unrestricted image proxy.
- **Accessible.** The SVG includes a `<title>` naming the state; color is paired with a text label, never color alone.
- **No secrets, no tracking.** The badge carries no cookies, tokens, or trackers.

## States

Operational, Degraded, Partial outage, Major outage, Maintenance, Unknown. Colors map through the shared `overallToBadgeStatus` vocabulary for consistency with the design system.

## JSON alternative

`GET /status/[slug]/api` returns an allowlisted JSON projection (overall status, components, active incidents, upcoming maintenance, last updated, schema version) for programmatic consumers. Same rate limiting and CORS policy.
