# Fajita self-monitoring

**Date:** 2026-07-17  
**Owner:** operations

## Status page components

Create a public status page (internal fixture org, `is_internal = true`) with components defined in `src/lib/platform/self-monitoring.ts`:

- Website
- Authenticated application
- Monitoring checks
- Alert delivery
- Public status pages
- Billing
- Support chat

Prefer a custom domain such as `status.fajita.io` with managed TLS. Hosted status routes must remain reachable when Clerk is down (existing `(status)` layout independence).

## Self-monitors

From the fixture org, create HTTP monitors for:

| Key | Path |
| --- | --- |
| homepage | `/` |
| pricing | `/pricing` |
| health_app | `/api/health` |
| status_surface | `/status` |
| llms | `/llms.txt` |

Add at least one check from an external vantage (second region or an independent uptime probe) so Fajita is not only watching itself from the same process that fails.

## Health endpoint

`GET /api/health` returns process liveness plus non-secret flags (`sentryConfigured`, `billingEnforcementEnabled`). It does **not** probe Postgres or Stripe, by design.

## Seed

When Stripe/Clerk fixture users exist, run an operator seed to create the internal org and status page. Until then, component definitions and the health route are ready; LB-012 remains open until the page is live on production DNS.
