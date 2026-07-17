# Status page architecture (Phase 8)

Fajita status pages turn monitoring and incident data into a calm, branded, public trust surface. This document is the map: how the pieces fit, where the public/private boundary lives, and which parts are shipped versus deferred.

## Design principle

> During an outage, clarity is the brand.

The public renderer is the calmest, most resilient Fajita surface. It renders server-side from a pre-built public snapshot, ships only its own stylesheet, and never depends on the authenticated application being healthy.

## Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Data model | `supabase/migrations/2026072200*` | Tables, RLS, uptime rollup function |
| Data access | `src/lib/status-pages/*.ts` | Service-role reads/writes, all org-scoped |
| Public state | `src/lib/status-pages/public-state.ts` | Centralized component + overall status calculation |
| Projection | `src/lib/status-pages/projection.ts` | Builds the public-safe snapshot; only allowlisted fields |
| Server actions | `src/lib/app/actions/status-pages.ts` | Permissioned, rate-limited, audited mutations |
| Management UI | `src/app/(app)/app/status-pages/**` | Authenticated create/configure/publish |
| Public renderer | `src/app/(status)/**` | Anonymous, cached, minimal-JS rendering |
| Host routing | `src/middleware.ts` | Hosted subdomain + custom domain rewrites |
| Internal lab | `src/app/internal/status-page-lab` | Fixture-driven QA of every state |

## Public/private boundary

There is exactly one path from internal data to the public page: the **public snapshot** (`status_page_public_snapshots`). The renderer reads only the snapshot. It never joins internal tables at request time and never receives internal notes, monitor names, assignees, evidence, secret URLs, or subscriber emails.

Anonymous roles (`anon`) cannot read any authenticated status-page table. See `docs/database/phase-8-rls.md`.

## Status calculation

All surfaces (renderer, projection builder, management preview) derive state from `public-state.ts` so the number never disagrees. Rules:

- "All Systems Operational" is calculated, never hardcoded.
- Internal verification is not automatically exposed as an outage (anti-flicker).
- Scheduled maintenance never hides an unrelated confirmed outage.
- Confirmed outages are never downgraded to flatter uptime.
- Unknown/unmeasured monitors are honest no-data, not a fake outage.

See `docs/application/status-page-components.md` for calculation modes.

## Hosted architecture

Hosted subdomains use `<slug>.status.fajita.io`. Custom domains point a CNAME at a shared target and prove ownership with a DNS TXT challenge. Real TLS/CDN provisioning is performed by the hosting platform (Vercel); the app tracks state and never claims TLS is active before HTTPS is confirmed. See `status-page-tls.md` and `status-page-domain-routing.md`.

## Shipped vs deferred

Shipped: data model, RLS, creation, components/groups, monitor mapping, public state, incident/maintenance/notice publication, uptime history, versioning + rollback, themes, appearance, hosted subdomains, custom-domain verification flow, public renderer, JSON API, SVG badge, OG image, SEO controls, subscriber form/data foundation (gated), internal lab, analytics, overview + onboarding integration.

Deferred (documented, not faked): live TLS/CDN provisioning wiring (platform-operated), background reconciliation job, subscriber email delivery (Phase 9), password-protected and private-link rendering enforcement beyond not-found gating, executed load tests against production infra.
