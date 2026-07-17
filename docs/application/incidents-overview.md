# Incidents (application overview)

The incident surfaces let an authorized team see confirmed operational states,
manage incidents, and keep an auditable record. Access requires authentication,
active organization membership, and the `incidents` feature (private beta;
platform admins always see it). Mutations require `incidents:manage`.

## Routes

| Route | Purpose |
| --- | --- |
| `/app/incidents` | List + active command center. Filters by view (`active`, `history`, `canceled`, `all`). |
| `/app/incidents/new` | Manual incident creation. |
| `/app/incidents/[id]` | Overview (default). |
| `/app/incidents/[id]/timeline` | Immutable timeline. |
| `/app/incidents/[id]/evidence` | Check evidence by monitor. |
| `/app/incidents/[id]/updates` | Updates and internal notes. |
| `/app/incidents/[id]/settings` | Affected monitors and metadata. |

`active` and `history` are query-parameter views of `/app/incidents` rather than
separate routes; the incident `overview` is the default detail page. Both are
deliberate adaptations to existing app conventions.

## Command center

The list header shows counts: active incidents, unacknowledged, verifying,
degraded, down, and active maintenance. Values are real (from
`getIncidentOverview`); no fabricated metrics. No alert-delivery or status-page
metrics appear (Phases 7 and 8).

## Header actions

Acknowledge, assign, add update, add internal note, change severity, resolve,
cancel. No "Send alert" and no "Publish to status page" in this phase.

## Monitor and overview integration

Monitor detail shows a separate Operational state card (lifecycle, latest check,
operational state, verification/recovery progress, flapping, active-incident
link). The organization overview shows an Operations section with the same
confirmed counts. The command palette adds "View active incidents", "Create
manual incident", and "Schedule maintenance", gated by feature and permission.
