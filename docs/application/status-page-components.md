# Status page components

Route: `/app/status-pages/[id]/components` (`ComponentsEditor`).

## Model

A component is a customer-facing service (Website, API, Authentication, ...). It maps to zero or more Phase 4/5 monitors. Components can be grouped.

Fields: name, description, slug, position, calculation mode, manual status (+ expiry), visibility, show-uptime, show-response-time.

## Calculation modes

Explicit modes, never a formula language (`src/lib/status-pages/public-state.ts`):

| Mode | Behavior |
| --- | --- |
| `any_critical` (default) | Most severe state among critical monitors; falls back to all monitors if none are critical. |
| `majority` | The most common state; ties resolve to the more severe (honest, not flattering). |
| `primary` | The first mapped monitor decides. |
| `manual` | Operator sets the public state directly. |

## Public component states

Operational, Degraded Performance, Partial Outage, Major Outage, Under Maintenance. A confirmed-down critical monitor is a Major Outage; a non-critical one is a Partial Outage. Internal verification is not exposed as an outage by default.

## Groups

Create, rename, describe, reorder, hide, delete. Deleting a group never deletes its components (they move to ungrouped).

## Manual override

Manual status wins over automatic calculation while active, supports an expiry, and is clearly indicated. It never rewrites monitor history and never claims automated health while active.

## Ordering and warnings

Ordering uses keyboard-accessible move controls, not drag-only. The editor warns when a component has no mapped monitor, or a mapped monitor is paused/archived/deleted.
