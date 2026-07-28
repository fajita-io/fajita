# Sentry production setup

**Date:** 2026-07-27  
**Owner:** operations  
**Blocker:** LB-001 resolved (Vercel Marketplace Sentry integration)

## Status

`@sentry/nextjs` is live in production. `/api/health` reports `sentryConfigured: true`. Vercel set `NEXT_PUBLIC_SENTRY_DSN` and related Sentry vars via the Marketplace integration.

## One-time setup

**Option A (recommended): Vercel Marketplace integration**

Requires a human in an interactive terminal (marketplace terms + Sentry OAuth):

```bash
vercel integration accept-terms sentry
vercel integration add sentry \
  -m name=Fajita \
  -m region=us \
  -m platform=javascript-nextjs \
  -p am3_f \
  -e production
vercel env pull .env.production.local --environment=production
vercel --prod
```

**Option B: existing Sentry project DSN**

1. Create a Sentry project for **fajita-io** (platform: Next.js).
2. Copy the DSN from **Project Settings → Client Keys**.
3. Run:

```bash
SENTRY_DSN=https://…@o….ingest.sentry.io/… \
NEXT_PUBLIC_SENTRY_DSN=https://…@o….ingest.sentry.io/… \
npm run wire:sentry -- --verify
vercel --prod
```

**Option C: API token**

```bash
SENTRY_AUTH_TOKEN=sntrys_… SENTRY_ORG_SLUG=your-org npm run wire:sentry -- --verify
```

Automated signup (`npm run wire:sentry:auto`) is blocked by Sentry reCAPTCHA on new accounts.

## Verify capture

After deploy (Sentry Marketplace sets `NEXT_PUBLIC_SENTRY_DSN` automatically):

```bash
curl -s https://fajita.io/api/health   # sentryConfigured: true
curl -X POST "https://fajita.io/api/internal/observability/sentry-probe" \
  -H "Authorization: Bearer $CRON_SECRET"
npm run smoke:authenticated            # 16/16 including sentry-configured
```

Verified 2026-07-27: probe returned `eventId`, health `sentryConfigured: true`, authenticated smoke 16/16.

## Notes

- Source map upload is optional (`SENTRY_AUTH_TOKEN` in CI).
- Do not log DSN values in customer-facing surfaces.
