# Status page domain routing

## Architecture choice

One consistent architecture: hosted subdomains at `<slug>.status.fajita.io`, custom domains via CNAME to a shared target. Path-based `/status/<slug>` is the development fallback. Internal database ids never appear in public URLs; the slug is the public identifier.

## Middleware

`statusHostRewrite` in `src/middleware.ts`:

- Requests to `<slug>.status.fajita.io` are rewritten to `/status/<slug>` (and sub-paths preserved).
- Requests to a mapped custom domain are rewritten to `/_status-host/<host><path>`, which resolves the snapshot by domain (`getPublicSnapshotByDomain`).
- Internal paths (`/api`, `/_next`, app/marketing hosts) are never rewritten.

The rewrite runs before Clerk protection, so public status hosts never touch the auth path.

## Custom domain resolution

`getPublicSnapshotByDomain(domain)` looks up the verified `status_page_domains` row, then returns the page's public snapshot. Only verified, non-removed domains resolve.

## Config

`src/lib/status-pages/config.ts` derives the zone and CNAME target from env with safe defaults:

- `NEXT_PUBLIC_STATUS_PAGE_DOMAIN` (default `status.fajita.io`)
- `NEXT_PUBLIC_STATUS_CNAME_TARGET` (default `cname.status.fajita.io`)

## Redirects

Primary domain selection updates `status_pages.primary_domain_id`. When a custom domain is removed, routing falls back to the hosted subdomain. Redirect-loop prevention: the hosted subdomain is always retained and cannot be deleted.

## Deferred

Apex-domain support is intentionally out of scope (subdomains only in v1). Live redirect issuance (301/302 between hosted and custom) is handled by the hosting platform once a primary is chosen; the app records intent.
