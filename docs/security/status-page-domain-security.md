# Status page domain security

## Ownership verification

Custom domains prove ownership with a DNS TXT challenge (`_fajita-challenge.<domain>`). Tokens are high-entropy, stored hashed (`secret.ts`), org- and domain-scoped, single-use, and expire after 7 days. Verification checks are rate-limited. Routing uses a CNAME to the shared target; HTTP file upload is never the sole method.

## Takeover prevention

- A domain is globally unique while active: adding a domain already connected elsewhere is rejected.
- Removal marks the row removed and frees it; reassignment requires re-verification.
- Verification re-runs after DNS changes; a domain is not primary until verified.

## Normalization

`normalizeCustomDomain` strips scheme/path/port, rejects non-ASCII (homograph risk; punycode required), rejects apex domains (subdomains only in v1), and rejects any `fajita.io` hostname (no platform impersonation).

## TLS

Fajita never stores certificates or private keys. TLS is managed by the hosting platform after verification. A domain is never marked active before HTTPS is confirmed. See `docs/engineering/status-page-tls.md`.

## Headers

Public pages receive safe defaults (CSP, frame policy, referrer policy, MIME-sniffing protection, HSTS on approved domains). Customers cannot set arbitrary headers.
