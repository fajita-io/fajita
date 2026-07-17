# Status page domains

Route: `/app/status-pages/[id]/domain` (`DomainsManager`). Requires `status_pages:publish`.

## Hosted address

Always available at `<slug>.status.fajita.io` with managed HTTPS, no setup.

## Custom domain flow

1. Enter a subdomain (e.g. `status.yourcompany.com`; apex domains not supported yet).
2. Normalize and validate (`normalizeCustomDomain`): strips scheme/path/port, rejects non-ASCII (homograph risk), rejects `fajita.io`, rejects duplicates already connected elsewhere.
3. Add records: a CNAME (routing) to the shared target and a TXT challenge (ownership).
4. Verify DNS (`verifyDomain` checks the TXT over real DNS).
5. TLS provisions after verification; the domain is not primary until verified.
6. Optionally set primary; the hosted subdomain remains as fallback.

## DNS guidance

The UI shows record type, name, and value, and states that changes may take time depending on the provider and existing TTL. It never promises exact propagation time or tells users to broadly disable security settings. Tokens are high-entropy and stored hashed; a rotate action regenerates records.

## Security

Domains are globally unique while active (no cross-tenant takeover). Removal frees routing and falls back to the hosted subdomain. The hosted subdomain cannot be removed. See `docs/security/status-page-domain-security.md`.
