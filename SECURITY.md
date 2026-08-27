# Security Policy

Fajita is uptime monitoring software operated at [fajita.io](https://fajita.io) and prepared for eventual open-source release under AGPL-3.0. This policy covers vulnerability reporting for the software and the hosted service.

## Supported versions

| Version | Supported |
| --- | --- |
| Production at fajita.io | Yes |
| `main` branch | Yes, for coordinated disclosure with maintainers |
| Older commits / forks | Best effort only |

Security fixes are applied to production and the active development branch. Self-hosted deployments should track releases once published.

## Reporting a vulnerability

**Do not** open public GitHub issues for exploitable security problems before a fix is available.

Report vulnerabilities by email using the contact form at [fajita.io/contact](https://fajita.io/contact) with topic **Security report**, or use [GitHub private vulnerability reporting](https://github.com/fajita-io/fajita/security/advisories/new) when available. You may also write to:

```text
Fajita
1001 S Main St, Ste 600
Kalispell, MT 59901
```

Include:

- Description of the issue and impact
- Steps to reproduce (minimal proof of concept is enough)
- Affected URLs, routes, or components if known
- Your contact for follow-up (optional but helpful)

We aim to acknowledge reports within **3 business days** and provide a remediation timeline when the report is valid.

## What we consider in scope

- Authentication and authorization bypass
- Cross-tenant data access (IDOR)
- SSRF via monitor checks, alert webhooks, or network tools
- Secret exposure in responses, logs, or exports
- Billing or entitlement bypass
- Status page or subscriber data leaks
- Webhook signature verification failures
- Cryptographic issues affecting stored monitor or channel secrets

## Out of scope (ordinarily)

- Social engineering of Fajita staff or customers
- Denial of service against fajita.io without prior coordination
- Issues in third-party services (Clerk, Stripe, Supabase, Vercel) except where Fajita integration is at fault
- Missing security headers on assets we do not control
- Reports requiring physical access to a self-hoster's infrastructure

## Security expectations for self-hosters

If you run Fajita yourself:

- Restrict egress from monitor workers (SSRF defenses are in application code but network controls remain your responsibility)
- Protect `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `MONITOR_SECRET_KEYRING`, and worker bearer tokens
- Use TLS for all public endpoints
- Keep dependencies updated
- Do not expose `/api/internal/*` routes without authentication at the edge

## Disclosure

We request coordinated disclosure. Please allow reasonable time to investigate and deploy fixes before public disclosure. We will credit reporters who wish to be named when fixes are published.

## Safe harbor

We support good-faith security research that follows this policy and avoids privacy violations, service disruption, or access to other customers' data.
