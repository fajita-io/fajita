# Documentation screenshot system

Internal. Screenshot workflow, fixtures, and freshness. Status: framework ready,
captures deferred.

**Date:** 2026-07-17

## Model

Screenshots are content blocks: `screenshot(sourceRoute, alt, caption, src?)`.
`alt` is required and enforced by validation. `sourceRoute` records which route
the image depicts so a freshness check can compare against product changes.
Until an image is captured, the block renders an accessible labeled placeholder
(`role="img"`, `aria-label`) so pages never show a broken image and alt text is
still exposed.

## Capture workflow (when enabled)

1. Run the app against the controlled documentation fixture environment.
2. Capture at stable viewports (light and dark where relevant) using the
   existing Playwright-based screenshot tooling pattern in `scripts/`.
3. Redact any secret, email, real domain, or customer data before saving.
4. Optimize to a modern format with fixed dimensions to avoid layout shift.
5. Store under a docs asset path and set `src` on the block.

## Fixtures

Captures must use deterministic fixture data (website, API, SSL, heartbeat
monitors; active and resolved incidents; maintenance; Slack, Discord, and
webhook channels; a published status page; subscribers; a weekly report; a
billing plan; an affiliate dashboard). Fixtures use `example.com`,
`api.example.com`, and `status.example.com` and reserved identifiers. Fixtures
are excluded from production analytics and revenue metrics.

## Freshness

Because each block records `sourceRoute`, a future check can flag screenshots
whose source route changed. Alt text and captions carry the meaning in the
meantime, so the platform is fully usable before images land.

## Why deferred

Real captures require the controlled fixture environment to be stood up. The
platform, alt-text enforcement, responsive rendering, and placeholder states
are complete; capture is a bounded follow-up that does not block launch.
