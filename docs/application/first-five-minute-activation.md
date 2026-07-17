# First-five-minute activation

Phase 11. The precise activation definitions. These are the only definitions
used anywhere (checklist, emails, analytics, lifecycle rules).

## First monitor activated

A valid monitor was created through the real Phase 5 builder, passed or
acknowledged test-before-save, was activated, and has a live schedule.
Recorded as `first_monitor_activated_at`.

## First real result

The monitor completed at least one real scheduled check
(`check_executions.is_test = false`). A manual test never counts. Recorded
as `first_real_check_at`.

## Alert path ready

One active verified alert channel, plus one active routing rule that routes
at least one incident-opening event (`OPENING_EVENT_TYPES` in
`src/lib/onboarding/activation.ts`). Recorded as `alert_path_ready_at`.

## Status page ready

One published status page with at least one visible component that has an
active monitor mapped to it, on a functioning hosted subdomain or custom
domain. Recorded as `status_page_ready_at`.

## Full activation

First real result, alert path ready, and status page ready are all true.
Recorded as `activated_at`.

## What never counts

- Signup completion is not activation.
- Manual tests and test-before-save runs are not first value.
- Sample fixtures are not customer activation.
- Button clicks do not complete steps; only observed product state does.

## Measurement

All milestones are server timestamps written by `syncActivationMilestones`
on null-to-value transitions. Time-to-value is computed as the difference
between `organizations.created_at` and each milestone. Nothing is
fabricated: the three-minute and five-minute targets in the product goals
are targets, and actual completion times come from these timestamps only.
