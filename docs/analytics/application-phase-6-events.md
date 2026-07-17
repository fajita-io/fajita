# Phase 6 application analytics events

Goals are defined in `src/lib/analytics/goals.ts` (`DataFastGoals`) and tracked
with `trackGoal` (client) or `trackServerGoal` (server). Metadata is bounded and
non-sensitive.

## Never send

Incident titles, internal notes, public-message content, monitor URLs, response
bodies, secret values, customer names, assignee email, or detailed failure
payloads. Metadata is limited to enumerated values (severity, origin, operational
state, suppression policy) and counts.

## Incident events

| Goal | Constant | Trigger |
| --- | --- | --- |
| `incident_list_viewed` | `incidentListViewed` | Incident list opened. |
| `incident_viewed` | `incidentViewed` | Incident detail opened. |
| `incident_opened_automatic` | `incidentOpenedAutomatic` | Engine opened an incident (server). |
| `manual_incident_started` | `manualIncidentStarted` | Manual incident form opened. |
| `manual_incident_created` | `manualIncidentCreated` | Manual incident created. |
| `incident_acknowledged` | `incidentAcknowledged` | Acknowledged. |
| `incident_assigned` | `incidentAssigned` | Assigned. |
| `incident_severity_changed` | `incidentSeverityChanged` | Severity changed. |
| `incident_note_added` | `incidentNoteAdded` | Internal note added. |
| `incident_update_added` | `incidentUpdateAdded` | Update added. |
| `incident_resolved` | `incidentResolved` | Resolved. |
| `incident_canceled` | `incidentCanceled` | Canceled. |
| `incident_reopened` | `incidentReopened` | Reopened. |
| `incident_evidence_viewed` | `incidentEvidenceViewed` | Evidence tab viewed. |
| `incident_timeline_filtered` | `incidentTimelineFiltered` | Timeline filtered. |
| `incident_report_exported` | `incidentReportExported` | Report exported (when export ships). |

## Maintenance events

| Goal | Constant |
| --- | --- |
| `maintenance_creation_started` | `maintenanceStarted` |
| `maintenance_created` | `maintenanceCreated` |
| `maintenance_updated` | `maintenanceUpdated` |
| `maintenance_canceled` | `maintenanceCanceled` |
| `maintenance_activated` | `maintenanceActivated` |
| `maintenance_ended` | `maintenanceEnded` |

## Operational-state events

`monitor_entered_verification`, `monitor_entered_degraded`,
`monitor_entered_down`, `monitor_entered_recovery`,
`monitor_returned_operational`, `monitor_flapping_detected`. Emitted from
transitions with bounded metadata (operational state only).

## Reserved names

Payment goal names remain reserved (see `AGENTS.md`). None of the Phase 6 goals
collide with them.
