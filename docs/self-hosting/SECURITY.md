# Security for self-hosted deployments

Practical guidance for operating Fajita on your infrastructure. This complements the project [SECURITY.md](../../SECURITY.md) vulnerability reporting policy.

## Network and TLS

- Terminate TLS at a reverse proxy (Caddy, Nginx, Traefik) or your load balancer
- Set `NEXT_PUBLIC_APP_URL` to your public HTTPS origin
- Do not expose PostgreSQL or PostgREST directly to the internet
- Restrict worker egress; SSRF protections exist in application code but network controls remain your responsibility

## Secrets

Protect these values:

| Secret | Purpose |
| --- | --- |
| `MONITOR_SECRET_KEYRING` | Decrypts stored monitor and channel secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database access |
| `CLERK_SECRET_KEY` | Authentication |
| `CRON_SECRET` | Protects cron and ops endpoints |
| Worker bearer tokens | Internal worker authentication |

Store secrets in a secret manager or encrypted env injection. Never commit them to git.

## Database

- Run PostgreSQL on a private network
- Use strong passwords and least-privilege roles in production
- Enable regular backups and test restore (see [BACKUPS.md](./BACKUPS.md))
- Apply migrations with `npm run db:migrate` or the Compose `migrate` service

## Authentication

- Use your own Clerk application with correct redirect URLs
- Configure Clerk webhooks for organization provisioning
- Restrict admin routes at the edge if exposing internal APIs

## Outbound monitoring

- Default: private IPs, loopback, and metadata endpoints are blocked
- `FAJITA_ALLOW_PRIVATE_NETWORKS=true` enables internal target monitoring; use only on trusted networks

## Updates

- Track [CHANGELOG.md](../../CHANGELOG.md) and [UPGRADING.md](./UPGRADING.md)
- Rebuild or pull updated container images on release
- Rotate secrets after personnel changes or suspected compromise

## Logging

- Scrub auth headers, cookies, API keys, webhook secrets, and monitor credentials before sharing logs in issues
- See issue templates for sanitization guidance

## Related docs

- [Configuration](./CONFIGURATION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Privacy (self-hosted)](./PRIVACY.md)
- [Examples: reverse proxy](../../examples/caddy/README.md)
