# Incident recap generation

Phase 11. Factual post-incident recaps for organization members. Internal
communication only; never sent to status-page subscribers.

## Eligibility

`generateIncidentRecapsBatch` (`src/lib/reports/incident-recaps.ts`) selects
incidents that are resolved, past a 30-minute stabilization window, of
eligible severity, and with meaningful duration (at least 5 minutes, from
`LIFECYCLE_TIMING`). Transient blips do not earn recaps. One recap per
incident is enforced by the unique `incident_id` on `incident_recaps`.

## Snapshot contents

The immutable snapshot records: title, severity, origin, key timestamps
(started, confirmed open, acknowledged, recovery start, resolved), total
duration, affected monitors (safe names), public components, first failure
category, timeline summary, alert delivery summary, and public update
summary. It excludes secrets, response bodies, request headers, subscriber
emails, provider credentials, and platform-admin notes.

## Root cause and corrections

Root cause is never invented. Authorized users (`incidents:manage`) may
enter or correct it through `updateRecapRootCauseAction`; every change is
recorded in `incident_recap_revisions` with previous value, new value,
actor, and time, and bumps the recap revision. A sent recap email is never
silently rewritten; corrections live in the application view.

## Follow-up actions

`incident_follow_up_actions` is a lightweight list (title, description,
owner, due date, status open/completed/dropped). No project-management
system, no automatic task reminder emails, nothing public.

## Email

One recap intent per eligible member who has `incident_recaps` enabled,
deduplicated per incident and recipient. Factual language only: the recap
states what Fajita confirmed and when, and mentions root cause only when a
user recorded one.
