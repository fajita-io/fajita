# Self-hosted telemetry

Self-hosted Fajita does **not** phone home by default.

## Default behavior (`FAJITA_DEPLOYMENT_MODE=self_hosted`)

| System | Default |
| --- | --- |
| DataFast analytics | Off |
| Google Analytics | Off |
| Sentry error reporting | Off unless DSN set **and** `FAJITA_TELEMETRY_ENABLED=1` |
| AI crawler tracking middleware | Off (no DataFast website ID) |

## Opt-in

Explicitly enable analytics:

```text
FAJITA_ANALYTICS_ENABLED=1
NEXT_PUBLIC_DATAFAST_WEBSITE_ID=...
NEXT_PUBLIC_DATAFAST_DOMAIN=...
# and/or
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
```

Explicitly enable Sentry:

```text
FAJITA_TELEMETRY_ENABLED=1
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
```

Use **your own** analytics and error reporting projects. Never Fajita Cloud project IDs.

## What is never transmitted

Self-hosted mode does not send monitor URLs, incident details, user emails, or deployment metadata to Fajita-operated services by default.

Monitor checks originate from **your worker** to **your configured targets** only.

## Cloud mode contrast

Fajita Cloud may enable product analytics and operational monitoring per Cloud policy. Cloud defaults are unchanged by self-hosting work.

## Verification

```bash
npm run selfhost:doctor
```

Check `Analytics default` and confirm no Fajita-owned IDs appear in `.env` for self-hosted installs.
