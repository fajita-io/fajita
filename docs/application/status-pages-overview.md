# Status pages: overview

Status pages let a Fajita customer publish a branded public page that shows what is working, what is not, and what the team is doing about it.

## Where

- Management: `/app/status-pages` (list), `/app/status-pages/new` (create), `/app/status-pages/[id]/*` (configure).
- Public: `<slug>.status.fajita.io` (hosted) or a connected custom domain; `/status/[slug]` in development.

## Availability

Gated by the `statusPages` feature flag (currently `private_beta`: platform admins and opted-in orgs). Permissions: `status_pages:manage` (build/edit) and `status_pages:publish` (make live, publish incidents/maintenance, manage domains, roll back). Members can build; publishing is an admin/owner action.

## Management sections

Overview, Components, Incidents, Maintenance, Appearance, Domain, SEO, Versions, Preview, Settings. Each is a tab under the page detail (`StatusPageSubnav`).

## What is real

Counts on the app overview and page overview come from real records. There are no fake subscriber counts, no fake view counts, and no fabricated uptime. "All Systems Operational" is calculated from mapped monitors, never hardcoded.
