# Status page creation

Route: `/app/status-pages/new` (`CreateStatusPageForm`).

## Steps

1. **Name** the page.
2. **Claim a hosted subdomain.** Real-time availability check via `checkSubdomainAction`. Validated against DNS label rules and a reserved-word list; platform-impersonating names are blocked.
3. **Timezone.** Populated from `Intl.supportedValuesOf('timeZone')`, defaulting to the org timezone.

On submit, `createStatusPageAction` creates a draft page and materializes the hosted-subdomain domain row (verified, TLS active, since Fajita owns the zone). The user is routed to Components to continue.

## Guarantees

- Server-side draft creation; nothing is public until publish.
- Slugs are globally unique (case-insensitive).
- No customer secrets in browser storage.
- Keyboard and mobile friendly; clear validation messages.

A basic page can be created, given components, previewed, and published in a few minutes.
