# Architecture overview

Fajita is uptime monitoring software with a web application, PostgreSQL-backed scheduler, Go monitor workers, and notification delivery. Self-hosted and Fajita Cloud share the same core.

## High-level flow

```text
Web app
  ↓
Scheduler (lease due checks)
  ↓
Workers (execute monitors)
  ↓
Verification (confirm failures)
  ↓
Incident engine (open, update, recover)
  ↓
Notifications (Slack, email, webhooks)
  ↓
Status page (public incident projection)
```

## Components

### Web application (Next.js)

- Authenticated product UI and API routes
- Heartbeat ingestion at `/api/heartbeat/{token}`
- Cron endpoints for scheduler sidecars and cloud cron
- Status page rendering at `/status/{slug}`

### PostgreSQL

- Monitors, check results, incidents, alert channels, status pages
- Scheduler lease ledger (`check_schedules`, lease functions)
- No Redis required for core scheduling

### PostgREST

- Supabase-compatible REST API used by the web app
- JWT auth aligned with Clerk + Supabase integration

### Go monitor worker

- Leases due checks from PostgreSQL
- Executes HTTP/HTTPS/API and SSL checks with SSRF protections
- Drains verification queue with repeated checks
- Detects missed heartbeats

### Alert worker (Node)

- Consumes alert outbox
- Delivers Slack, Discord, signed webhooks, and email

### Scheduler sidecar (self-hosted)

- Calls `/api/cron/monitor-tick` and `/api/cron/tick` on interval
- Replaces Vercel Cron when self-hosting

## Persistence and queues

- All durable state lives in PostgreSQL
- Alert delivery uses an outbox pattern processed by the alert worker or cron
- Monitor secrets are encrypted at rest with `MONITOR_SECRET_KEYRING`

## Deployment modes

| Mode | Trigger | Billing | Default telemetry |
| --- | --- | --- | --- |
| Cloud | `FAJITA_DEPLOYMENT_MODE` unset or `cloud` | Stripe | Product analytics opt-in |
| Self-hosted | `FAJITA_DEPLOYMENT_MODE=self_hosted` | Disabled locally | Off unless opted in |

## Related docs

- [Self-hosted architecture](../self-hosting/ARCHITECTURE.md)
- [Monitoring execution](./MONITORING.md)
- [Self-hosted vs Cloud](../SELF_HOSTED_VS_CLOUD.md)

## Security note

This document describes public architecture only. Do not expose internal admin routes, production infrastructure identifiers, or operator credentials in public deployments.
