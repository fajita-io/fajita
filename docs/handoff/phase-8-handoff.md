# Phase 8 handoff

Public status pages, components, incident/maintenance publication, uptime history, custom domains, themes, and the resilient public renderer.

## Entry points

- Architecture: `docs/engineering/status-page-architecture.md`
- Public rendering: `docs/engineering/status-page-public-rendering.md`
- Projections: `docs/engineering/status-page-projections.md`
- Cache: `docs/engineering/status-page-cache-strategy.md`
- Domains + TLS: `docs/engineering/status-page-domain-routing.md`, `status-page-tls.md`, `docs/security/status-page-domain-security.md`
- Versioning: `docs/engineering/status-page-versioning.md`
- Badges/API: `docs/engineering/status-page-badges.md`
- Application guides: `docs/application/status-page-*.md`
- Security: `docs/security/status-page-*.md`
- Database: `docs/database/phase-8-schema.md`, `phase-8-rls.md`
- Privacy: `docs/privacy/phase-8-data-map.md`
- Analytics: `docs/analytics/application-phase-8-events.md`
- Observability: `docs/observability/status-pages.md`
- Performance: `docs/performance/status-page-budget.md`
- Testing: `docs/testing/phase-8-test-matrix.md`, `phase-8-load-results.md`
- Transfer: `docs/handoff/status-page-transfer.md`

## Phase 9 contract

Subscriber tables (`status_page_subscribers`, `status_page_subscriber_preferences`) exist with consent fields and hashed confirmation tokens. The public subscriber form is built and feature-gated. Phase 9 adds double opt-in confirmation, incident/maintenance notification delivery, and preference management. No subscriber emails are sent in Phase 8, and no addresses are publicly collected.

## Explicitly not implemented in Phase 8

Subscriber email/SMS delivery, Stripe billing, affiliate system, Pamphlet chatbot, AI incident writing, AI status summaries, and any fake public status data. Live TLS activation callback, background reconciliation sweep, and executed load/field tests are operations tasks documented as deferred.
