# Cloudflare DNS for fajita.io

DNS for fajita.io runs on Cloudflare and points at the Vercel `fajita-io` project.

## Identifiers

| Field | Value |
| --- | --- |
| Zone | `fajita.io` |
| Zone ID | `0e44cc835b97bd56dc0b6731b099fb34` |
| Account ID | `e4f4f02d85a43769e102a361824dfc60` |
| Vercel project | `fajita-io` (`prj_w7eAnaASkV48VcWVd1uCvZp6MaQg`) |

Nameservers (registrar must use these):

- `ada.ns.cloudflare.com`
- `matt.ns.cloudflare.com`

## Required DNS records

All records are **DNS only** (Cloudflare proxy off) so Vercel terminates TLS.

| Type | Name | Value | Purpose |
| --- | --- | --- | --- |
| A | `fajita.io` | `76.76.21.21` | Marketing, app, API |
| A | `www.fajita.io` | `76.76.21.21` | www redirect target on Vercel |
| A | `status.fajita.io` | `76.76.21.21` | Status page zone |
| CNAME | `*.status.fajita.io` | `4106b7d014662895.vercel-dns-016.com` | Hosted status subdomains |
| CNAME | `cname.status.fajita.io` | `4106b7d014662895.vercel-dns-016.com` | Customer custom-domain CNAME target |
| CNAME | `clerk.fajita.io` | `frontend-api.clerk.services` | Clerk Frontend API (DNS only) |
| CNAME | `accounts.fajita.io` | `accounts.clerk.services` | Clerk Accounts portal (DNS only) |
| CNAME | `clkmail.fajita.io` | `mail.22giblw4f189.clerk.services` | Clerk transactional mail |
| CNAME | `clk._domainkey.fajita.io` | `dkim1.22giblw4f189.clerk.services` | Clerk DKIM |
| CNAME | `clk2._domainkey.fajita.io` | `dkim2.22giblw4f189.clerk.services` | Clerk DKIM |

Apply Clerk records only:

```bash
CLOUDFLARE_API_TOKEN=your-token npm run dns:clerk
```

Without `clerk.fajita.io`, production Clerk keys (`pk_live_`) cannot authenticate users on `fajita.io`.

Vercel domains attached to the project:

- `fajita.io`, `www.fajita.io`
- `status.fajita.io`, `*.status.fajita.io`, `cname.status.fajita.io`

## Apply with script

Create a Cloudflare API token with **Zone → DNS → Edit** for `fajita.io`, then:

```bash
CLOUDFLARE_API_TOKEN=your-token npx tsx scripts/cloudflare-dns-setup.ts
```

Or add to `.env.local` (never commit):

```bash
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ZONE_ID=0e44cc835b97bd56dc0b6731b099fb34
CLOUDFLARE_ACCOUNT_ID=e4f4f02d85a43769e102a361824dfc60
```

## Verify

```bash
vercel domains inspect fajita.io
dig A fajita.io +short
dig A www.fajita.io +short
dig A status.fajita.io +short
SMOKE_BASE_URL=https://fajita.io npm run smoke:public
```

## Email (later)

See `docs/operations/email-and-security-setup.md` for Resend SPF, DKIM, DMARC, webhooks, and Vercel env.

## SSL note

Do not orange-cloud (proxy) these records while Vercel serves the site. Proxied records can break certificate issuance or cause redirect loops unless Cloudflare SSL mode is tuned for Vercel.

## Legacy cleanup

If the domain previously used park.io parking, delete any leftover `www` CNAME to `park.io` before adding the Vercel A record. The setup script handles this automatically on re-run.
