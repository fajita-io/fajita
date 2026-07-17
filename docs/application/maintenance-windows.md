# Maintenance windows (application)

Maintenance lets a team declare expected downtime so failures do not open
incidents. Access requires the `maintenance` feature (private beta; platform
admins always) and `maintenance:manage` for mutations.

## Routes

`/app/maintenance` (list by status), `/app/maintenance/new`,
`/app/maintenance/[id]`, `/app/maintenance/[id]/edit`.

## Model

A window has name, description, public summary, timezone, start/end, suppression
policy, affected monitors, created-by, and status
(`scheduled | active | completed | canceled`). Times are stored in UTC and
displayed in the window timezone. The create/edit form converts wall-clock local
input to UTC using the selected timezone offset; the edit form converts back.

## Suppression policies

- `suppress_incidents` (default): checks continue, results are stored, eligible
  failures do not open incidents, monitor shows `maintenance`.
- `annotate_only`: failures remain visible in the maintenance occurrence without
  becoming separate incidents.
- `do_not_suppress`: informational only.

Checks are never stopped during maintenance by default: monitoring during
maintenance provides useful evidence.

## Start and end behavior

`public.maintenance_tick` activates due occurrences and completes finished ones.
On start, affected monitors are marked `maintenance` and prior state is
preserved; an already active incident is not resolved merely because maintenance
begins. On end, the engine does not assume health: the next real results are
evaluated, and an incident opens if failures persist and confirmation is met.

## Deferred

Recurring maintenance is deferred; one-time maintenance is fully implemented. See
the Phase 6 report.
