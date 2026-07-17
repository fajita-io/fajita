# Status page maintenance

Route: `/app/status-pages/[id]/maintenance` (`MaintenanceManager`).

Maps Phase 6 maintenance windows to public maintenance projections.

## Public fields

Title, summary, start time, end time, timezone, affected components, current state. Never exposes internal suppression policy or internal notes.

## States

Scheduled, In Progress, Completed, Canceled.

## Display rules

- Upcoming, active, and recently completed maintenance are shown.
- Active maintenance never obscures an unrelated incident. Overall status shows the outage; maintenance only surfaces as overall state when nothing worse is happening (`computeOverallState`).
- Exact dates and timezone are shown (e.g. "July 20, 2026 from 1:00 AM to 2:00 AM MST"). Relative time is only a secondary convenience; persistent pages avoid vague phrases like "tomorrow".

## Publication

`publishMaintenanceAction` / `unpublishMaintenanceAction`, gated by `status_pages:publish`, audited, snapshot-refreshing. Maintenance is not published automatically unless configured.
