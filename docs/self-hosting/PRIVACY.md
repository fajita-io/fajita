# Privacy for self-hosted deployments

When you self-host Fajita, you are the data controller for monitor configuration, check results, incidents, status page content, and user accounts in your deployment.

## Data residency

Self-hosted data stays on infrastructure you operate. Fajita does not receive your monitor results, incident timelines, or end-user account data unless you explicitly configure outbound integrations or telemetry.

## Telemetry defaults

Self-hosted mode defaults:

| Signal | Default |
| --- | --- |
| Product analytics (DataFast) | Off |
| Error monitoring (Sentry) | Off unless configured |

See [TELEMETRY.md](./TELEMETRY.md) for opt-in behavior and environment variables.

## Third-party providers you may configure

| Provider | Data sent when configured |
| --- | --- |
| Clerk | Authentication sessions and user profile data per Clerk's policy |
| SMTP / Resend | Alert and subscriber email content |
| Slack / Discord / webhooks | Alert payloads you route |
| Stripe | Not used in self-hosted mode (billing disabled) |

Review each provider's privacy policy before enabling integrations.

## Fajita Cloud separation

Fajita Cloud is a separate managed deployment operated by Fajita. Self-hosting does not send operational data to Fajita Cloud automatically.

## Your responsibilities

- Define retention and backup policy for PostgreSQL
- Restrict database and admin API access
- Inform your users if you operate a multi-tenant or customer-facing monitoring service built on Fajita
- Comply with applicable privacy law for your jurisdiction and use case

## Related docs

- [Security (self-hosted)](./SECURITY.md)
- [Backups](./BACKUPS.md)
- [Configuration](./CONFIGURATION.md)
