# Email DNS and Resend on fajita.io

Transactional email runs through **Resend** with a verified **fajita.io** sending domain. DNS lives in the same Cloudflare zone as the site.

## Vercel environment (production)

Set these in the `fajita-io` Vercel project:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Resend API key with send permission |
| `ALERT_EMAIL_FROM` | `Fajita <alerts@fajita.io>` |
| `CRON_SECRET` | Long random bearer for `/api/cron/tick` |
| `SUBSCRIBER_EMAIL_WEBHOOK_SECRET` | Svix signing secret from the Resend webhook |

Optional worker tokens (`ALERT_WORKER_TOKEN`, `SUBSCRIBER_WORKER_TOKEN`, `LIFECYCLE_WORKER_TOKEN`) are only needed if you run standalone workers instead of the unified cron tick.

Sync from a local `.env.local`:

```bash
./scripts/vercel-env-sync.sh production
```

## Resend domain verification

1. Create a **full access** Resend API key (not send-only).
2. Fetch DNS records Resend generates for `fajita.io`:

```bash
RESEND_FULL_API_KEY=re_... npm run resend:fetch-dns
```

3. Publish records to Cloudflare:

```bash
CLOUDFLARE_API_TOKEN=... npm run dns:email
```

Or combine fetch + apply in one step when both keys are set:

```bash
RESEND_FULL_API_KEY=re_... CLOUDFLARE_API_TOKEN=... npm run dns:email
```

The script also adds a DMARC monitoring record:

- `_dmarc.fajita.io` TXT `v=DMARC1; p=none; rua=mailto:alerts@fajita.io; fo=1`

Override with `DMARC_RUA_EMAIL=you@fajita.io`. Skip with `DMARC_DISABLE=1`.

Typical Resend records (exact values come from your dashboard):

| Type | Name | Purpose |
| --- | --- | --- |
| MX | `send.fajita.io` | Return-path / bounce handling |
| TXT | `send.fajita.io` | SPF for the send subdomain |
| TXT | `resend._domainkey.fajita.io` | DKIM |

## Resend webhook (subscriber bounces)

In Resend Dashboard → Webhooks:

- URL: `https://fajita.io/api/webhooks/subscriber-email`
- Events: `email.delivered`, `email.bounced`, `email.complained`, `email.delivery_delayed`
- Copy the signing secret into Vercel as `SUBSCRIBER_EMAIL_WEBHOOK_SECRET`

The route fails closed when the secret is unset.

## Security files shipped in the app

| Asset | Route |
| --- | --- |
| Security headers (CSP, HSTS, etc.) | All pages via `next.config.ts` |
| security.txt | `/.well-known/security.txt` |
| Responsible disclosure | `/legal/disclosure` |

## Verify

```bash
dig TXT send.fajita.io +short
dig TXT resend._domainkey.fajita.io +short
dig TXT _dmarc.fajita.io +short
curl -s https://fajita.io/.well-known/security.txt
```

Send a test from production once the domain shows **Verified** in Resend.
