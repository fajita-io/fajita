# Status page TLS

## Model

Hosted subdomains (`*.status.fajita.io`) are covered by the platform wildcard certificate: TLS is active immediately, no customer action.

Custom domains receive managed TLS from the hosting platform (Vercel) after DNS ownership is verified. Fajita tracks certificate state; it never issues or stores certificates or private keys itself.

## Status values

`status_page_domains.tls_status`: `pending` → `provisioning` → `active`, plus `renewal_issue`, `failed`, `removed`.

Rule: a custom domain is never marked primary/active until verification succeeds and HTTPS is confirmed. `verifyDomain` sets `tls_status = provisioning` on successful DNS verification; the platform activates it once HTTPS works. The app does not claim `active` on its own.

## Verification → TLS sequence

1. Customer adds domain → `pending_dns`.
2. Customer sets CNAME (routing) and TXT (ownership) records.
3. `verifyDomain` checks the TXT challenge over DNS. On match: `verification_status = verified`, `tls_status = provisioning`.
4. Hosting platform provisions and validates HTTPS → `tls_status = active`.
5. Customer may set the domain primary (allowed only when verified).

## Deferred / platform-operated

The actual certificate issuance, renewal, and expiration monitoring are performed by the hosting platform. Wiring the platform's domain API callbacks to flip `provisioning → active` automatically is an operations task. Until then, TLS state reflects verification progress and is reconciled by an operator. No insecure HTTP-only publication is possible: the hosted subdomain always has TLS, and custom domains are not primary until verified.
