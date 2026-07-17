# Incident recaps

Phase 11. Recap section on resolved incident pages
(`src/components/app/incidents/incident-recap-panel.tsx`), email through
the lifecycle pipeline.

## Application view

Resolved incidents past the stabilization window show the recap: severity,
origin, key timestamps, total duration, affected monitors, public
components, alert delivery summary, and public update summary, all from the
immutable snapshot. Authorized users (`incidents:manage`) can enter or
correct a root cause (versioned in `incident_recap_revisions`), add
follow-up actions, and mark the recap reviewed. Every change is audited.

## Email

Sent to members with the `incident_recaps` preference enabled, once per
incident per recipient. The email states severity, duration, affected
systems, key timestamps, and the confirmation language ("Fajita confirmed
the incident after N eligible failed checks; recovery was confirmed after N
consecutive successful checks"). Root cause appears only if a user recorded
one. Status-page subscribers never receive recaps; this is internal
organization communication.

## Follow-up actions

Lightweight list per incident: title, description, owner, due date, status.
No project management, no automatic reminders, nothing public.

## Boundaries

No secrets, response bodies, request headers, subscriber emails, provider
credentials, or platform notes appear in recaps. Minor transient events (\<5
minutes) do not generate recaps.
