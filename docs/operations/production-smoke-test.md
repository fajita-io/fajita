# Production smoke test

**Date:** 2026-07-17  
**Owner:** operations

## Public path smoke: PASSED (local production build)

```bash
npm run build
npm run start -- -p 3018
SMOKE_BASE_URL=http://127.0.0.1:3018 npm run smoke:public
```

Result: all scripted public paths returned 200, including `/api/health`, legal pages, docs, glossary, pricing, robots/sitemap/llms.

`https://fajita.io` did not resolve from this environment (DNS/deploy not live). Re-run with `SMOKE_BASE_URL=https://fajita.io` after DNS points at the Vercel project.

## Authenticated checklist: NOT RUN (LB-008 remaining)

Still required against a fixture org before Stage 1:

- Signup / organization creation
- Monitor create → manual test → scheduled check
- Incident fixture → recovery
- Email / Slack / Discord / webhook alerts
- Status page publish + custom domain
- Subscriber confirmation
- Billing checkout / portal / cancel / reactivate
- Pamphlet public + authenticated
- Internal command center + audit
- Export / deletion fixture
- Official Fajita status page

Mark fixtures `is_internal` and exclude from revenue metrics.
