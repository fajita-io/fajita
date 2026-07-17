# Navigation

## Model

Navigation is data, not markup. `src/lib/app/nav-model.ts` defines `NavItem` and `NavGroup` and a single `buildNav()` that gates every item by:

- feature availability (the resolved `FeatureMap`),
- organization permission (`can(role, permission)`),
- platform-admin status (reserved product routes are visible to admins as Planned).

The sidebar, mobile navigation, and command palette all read from this one model so they can never drift.

## Groups

| Group | Items | Availability |
| --- | --- | --- |
| Primary | Overview | GA |
| Primary | Monitors, Incidents, Status Pages, Integrations | Development, hidden from customers, Planned for platform admins |
| Organization | Team, Settings | GA, Team gated by `members:read` |
| Utility | Support, Service Status | GA |

## Rules

- Only functional or intentionally permitted destinations render. Development routes are hidden from ordinary customers, never shown as broken links.
- Reserved product routes shown to platform admins render a truthful pre-feature state (`src/components/app/pre-feature.tsx`), never fake metrics.
- Active state is derived from the current path; parent items highlight for nested routes.
- Every item has an accessible label and a valid icon from the brand icon set.

## Breadcrumbs

The top bar derives a contextual title / breadcrumb from the route. Settings subpages use a dedicated settings navigation (`settings-nav.tsx`).

## Mobile

Mobile uses a sheet, not a shrunk sidebar. It exposes org switching, account access, notifications, and the same grouped links. No critical setting is hidden behind desktop-only affordances.
