# Status page abuse prevention

Status pages can be abused for impersonation and phishing. Controls:

## Naming

- Reserved-subdomain list blocks `www`, `app`, `api`, `admin`, `support`, `status`, `billing`, `login`, `signup`, `security`, `fajita`, and internal service names.
- Names starting with `fajita` or otherwise impersonating the platform are rejected.

## Content

- No arbitrary HTML, CSS, or JavaScript. Public content is sanitized to plain text plus a tiny safe inline subset.
- No payment forms, no password-collection forms, no external embedded login forms.
- No file downloads from public custom content, no tracking pixels, no remote images, no masked destination redirects.
- External links are validated (http/https/mailto only) and opened with `rel="nofollow noopener noreferrer" target="_blank"`.

## Platform controls

- Every mutation is rate-limited per actor; public API and badge endpoints are rate-limited per client key.
- Platform-admin suspension and takedown are supported via page status (`suspended`, `pending_deletion`).
- Deferred: an automated suspicious-domain review queue and abuse-reporting intake (operations phase). Manual takedown is available now by unpublishing/suspending.
