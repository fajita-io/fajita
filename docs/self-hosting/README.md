# Self-hosting Fajita

Fajita runs on infrastructure you control without Fajita Cloud credentials.

## Start here

| Document | Purpose |
| --- | --- |
| [QUICKSTART.md](./QUICKSTART.md) | Fastest path to a running local install |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Services, ports, and data flow |
| [CONFIGURATION.md](./CONFIGURATION.md) | Environment variables |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | Clerk setup for self-hosters |
| [UPGRADING.md](./UPGRADING.md) | Version upgrades |
| [BACKUPS.md](./BACKUPS.md) | What to back up |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common failures |
| [TELEMETRY.md](./TELEMETRY.md) | Analytics and error reporting |
| [PRIVACY.md](./PRIVACY.md) | Data residency and telemetry |
| [SECURITY.md](./SECURITY.md) | Hardening for operators |

## Deployment mode

Set:

```text
FAJITA_DEPLOYMENT_MODE=self_hosted
```

Cloud mode remains the default when unset.

## Commands

```bash
npm run selfhost:doctor    # validate configuration
npm run selfhost:up        # docker compose up -d
npm run selfhost:down      # docker compose down
npm run selfhost:logs      # follow container logs
npm run db:migrate         # apply SQL migrations
npm run db:status          # migration status
npm run oss:selfhost-check # CI validation gate
```

## What self-hosted includes

- Full monitoring (HTTP, API, SSL, heartbeat)
- Failure verification via local worker fleet
- Incidents and recovery
- Status pages (path-based and configurable subdomain zone)
- Slack, Discord, and webhook alerts
- Optional email via SMTP or your own Resend key

## What self-hosted does not require

- Fajita production database or workers
- Fajita Stripe account or subscription
- Fajita-owned Resend, analytics, or Sentry
- Vercel Cron (scheduler sidecar or external cron instead)
