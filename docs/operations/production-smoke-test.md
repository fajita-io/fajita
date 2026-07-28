# Production smoke test

**Date:** 2026-07-27  
**Owner:** operations

## Public path smoke: PASSED

```bash
SMOKE_BASE_URL=https://fajita.io npm run smoke:public
```

Result: all scripted public paths returned 200 (57 paths), including `/api/health`, legal, docs, pricing, robots/sitemap/llms.

## Authenticated-adjacent smoke: PASSED (2026-07-27)

Service-role and cron checks (no browser login required):

```bash
FAJITA_SERVICE_STATUS_SLUG=platform npm run smoke:authenticated
```

| Check | Result |
| --- | --- |
| Internal org `fajita-platform` | OK |
| Published status page `platform` | OK |
| Active self-monitors (6) | OK |
| Monitor cron tick + recent checks | OK |
| App / internal route guards | OK |
| Stripe / Clerk webhook signature guards | OK |
| `/status` and `/status/platform` | OK |
| Billing enforcement in production | OK |
| Processed billing webhooks in DB | OK |
| Sentry DSN in production | OK (Vercel Marketplace integration, 2026-07-27) |

Use `SMOKE_ALLOW_MISSING_SENTRY=1` to pass while DSN is being wired.

## Browser login smoke: PASSED (2026-07-27)

Playwright + Clerk sign-in token against production:

```bash
SMOKE_USER_ID=user_3GmqPixKs1marjOxWyTaE5s305y \
SMOKE_ORG_ID=95d5b566-2b62-4ff8-b6c2-0de8f714f0ce \
npm run smoke:browser
```

| Check | Result |
| --- | --- |
| Clerk sign-in (ticket URL) | OK → `/app` |
| `/app` | OK (200) |
| `/app/monitors` | OK (200) |
| `/app/status-pages` | OK (200) |
| `/app/settings/billing` | OK (200) |
| `/app/support` | OK (200) |
| `/internal/launch` | OK (404 for non-admin; expected) |

Set `SMOKE_ORG_ID` to the internal org (`fajita-platform`) so billing enforcement does not redirect to payment setup.

## Browser login checklist (Stage 2 optional)

Still valuable before broad public signup:

- Signup / organization creation
- Monitor create → scheduled check in UI
- Incident fixture → recovery
- Billing checkout from `/app/settings/billing` (see `real-payment-test.md`)
- Pamphlet public + authenticated paths
- Export / deletion fixture

Mark fixture orgs `is_internal` and exclude from revenue metrics.
