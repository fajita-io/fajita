# Self-hosted configuration

All configuration flows through environment variables. Set `FAJITA_DEPLOYMENT_MODE=self_hosted` first.

## Required (self-hosted)

| Variable | Purpose |
| --- | --- |
| `FAJITA_DEPLOYMENT_MODE` | Must be `self_hosted` |
| `NEXT_PUBLIC_APP_URL` | Public URL for links, heartbeats, status pages |
| `NEXT_PUBLIC_SUPABASE_URL` | PostgREST/Supabase API base URL (browser + default server) |
| `SUPABASE_URL` | Optional server-only PostgREST URL (Docker: `http://rest:3000`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon JWT for client reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for server mutations |
| `DATABASE_URL` | Postgres connection (migrations, cron worker, doctor) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk app |
| `CLERK_SECRET_KEY` | Your Clerk app |
| `MONITOR_SECRET_KEYRING` | AES-256-GCM keyring for monitor secrets |
| `CRON_SECRET` | Bearer token for cron and ops health routes |

## Optional (self-hosted)

| Variable | Purpose |
| --- | --- |
| `CLERK_WEBHOOK_SIGNING_SECRET` | User provisioning webhook |
| `RESEND_API_KEY` | Email via Resend |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` | Email via SMTP |
| `SMTP_USER`, `SMTP_PASSWORD` | SMTP auth |
| `ALERT_EMAIL_FROM` | From address for alerts |
| `ALERT_WORKER_TOKEN` | Protect internal alert run endpoint |
| `MONITOR_WORKER_*` | Worker tuning (region, concurrency, lease batch) |
| `MONITOR_SECRET_KEYS` | JSON keyring for Go worker |
| `FAJITA_ALLOW_PRIVATE_NETWORKS` | Opt in to internal network checks |
| `FAJITA_ALLOWED_PRIVATE_CIDRS` | CIDR allowlist when private monitoring enabled |
| `FAJITA_ANALYTICS_ENABLED` | Opt in to DataFast/GA |
| `FAJITA_TELEMETRY_ENABLED` | Opt in to Sentry |
| `NEXT_PUBLIC_STATUS_PAGE_DOMAIN` | Status subdomain zone |
| `NEXT_PUBLIC_STATUS_CNAME_TARGET` | Custom domain CNAME target |
| `PLATFORM_ADMIN_USER_IDS` | Clerk user IDs for platform admin (usually empty) |

## Not required (self-hosted)

Stripe keys, Fajita Cloud DNS tokens, DataFast, GA, Sentry, affiliate tokens, and Fajita production Supabase credentials.

## Worker tuning

| Variable | Default | Notes |
| --- | --- | --- |
| `MONITOR_WORKER_CONCURRENCY` | 16 (8 in Compose) | Simultaneous checks |
| `MONITOR_WORKER_LEASE_BATCH` | 20 | Checks leased per poll |
| `MONITOR_WORKER_LEASE_SECONDS` | 60 | Lease TTL |
| `MONITOR_WORKER_ALLOW_LOOPBACK` | 0 | Dev only; never in production |
| `SCHEDULER_INTERVAL_SECONDS` | 60 | Cron sidecar interval |

## Configuration validation

```bash
npm run selfhost:doctor
```

Never prints secret values.

## Typed access in code

Use `deploymentConfig()` from `src/lib/deployment/config.ts`:

- `deploymentConfig().isSelfHosted`
- `deploymentConfig().billingEnabled`
- `deploymentConfig().analyticsEnabled`

Do not scatter raw `process.env.SELF_HOSTED` checks.
