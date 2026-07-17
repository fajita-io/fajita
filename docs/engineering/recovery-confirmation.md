# Recovery confirmation

A single successful check does not resolve an outage.

## Default policy

- On the first eligible success during an active incident, the monitor enters
  `recovering` (timeline event: recovery started).
- After `recovery_confirmation_threshold` consecutive eligible successes
  (default 2), the incident resolves and the monitor returns to `operational`.
- A failure during recovery returns the monitor to `degraded` or `down` and
  continues the same incident. It does not open a new one.
- While a monitor is flapping, the recovery threshold is raised by 2 so churn
  cannot resolve an incident prematurely.

## Guarantees

Recovery references exact check executions as evidence, is idempotent (duplicate
successes do not double-count), respects maintenance, respects monitor version
changes, records timeline events, writes a resolved outbox event, updates the
public projection, updates the operational state, and finalizes incident
duration.

## Manual resolution vs observed state

Manual tests do not resolve automatic incidents. An operator may resolve
manually with a required resolution summary and explicit confirmation. If checks
still fail, the UI warns clearly and the monitor's observed operational state is
not forced to `operational`. Incident lifecycle and observed operational state
are separate concerns and are documented as such. Failed checks are never
rewritten as successful.

Implemented in `app.evaluate_check_result` (recovery branch) and
`public.incident_resolve`. Mirrored and tested in
`src/lib/incidents/state-machine.ts` and `tests/incidents-state-machine.test.ts`.
