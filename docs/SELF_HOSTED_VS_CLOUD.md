# Self-hosted vs Fajita Cloud

Fajita ships one monitoring product in two deployment models. Feature parity for core monitoring is intentional. Operational responsibility is not.

## Self-hosted

You operate:

- Infrastructure (compute, database, networking)
- PostgreSQL backups and restore testing
- Application and worker upgrades
- TLS certificates and reverse proxy configuration
- Email delivery (SMTP or your Resend account)
- Clerk authentication instance
- Secret rotation and access control

You get:

- Full source under AGPL-3.0
- Unlimited local monitors (billing enforcement disabled)
- Same verification engine, incidents, status pages, and integrations
- Control over data residency

## Fajita Cloud

Fajita operates:

- Managed infrastructure and worker fleet
- Database backups and migrations
- Application updates and security patches
- Managed email and billing
- Production-grade scheduling and observability

You get:

- Faster time to value
- No worker or database operations
- Subscription-based plans with support through Fajita channels

## Comparison

| Capability | Self-hosted | Fajita Cloud |
| --- | --- | --- |
| HTTP / API monitoring | Yes | Yes |
| SSL monitoring | Yes | Yes |
| Heartbeat / cron monitoring | Yes | Yes |
| Failure verification | Yes | Yes |
| Incidents and maintenance | Yes | Yes |
| Status pages | Yes | Yes |
| Slack, Discord, webhooks | Yes | Yes |
| Email alerts | SMTP or your Resend | Managed |
| Stripe billing in product | No | Yes |
| Infrastructure management | You | Fajita |
| Backups | You | Managed |
| Updates | You | Managed |
| Worker operations | You | Managed |
| Custom domain automation | Manual / reverse proxy | Managed options |

## Choosing a model

Choose **self-hosted** when you need data control, air-gapped or private network monitoring, or deep customization under AGPL.

Choose **Fajita Cloud** when you want monitoring without operating workers, databases, or mail infrastructure.

Neither model is "lite." Self-hosted is not a demo tier. Cloud is not a hostage upgrade path.

## Switching

You can start self-hosted and move to Cloud later, or run self-hosted alongside Cloud for different environments. Migration tooling is not automated today; export your data and re-create monitors when moving between models.

## Related docs

- [Self-hosting quickstart](./self-hosting/QUICKSTART.md)
- [Configuration](./self-hosting/CONFIGURATION.md)
- [Privacy (self-hosted)](./self-hosting/PRIVACY.md)
