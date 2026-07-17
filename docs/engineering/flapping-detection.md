# Flapping detection

A monitor that rapidly alternates pass and fail must not spawn a new incident per
flip or emit an external event per result.

## Rule

While an incident is active, transitions caused by a failure interrupting
recovery are counted within a rolling window:

- Window: 15 minutes (`FLAP_WINDOW_MS`).
- Threshold: 4 transitions (`FLAP_THRESHOLD`).

When the count reaches the threshold inside the window, the monitor is marked
flapping (`monitor_operational_states.flapping_since`).

## Behavior once flapping

- The active incident stays open. No new incident is created for each flip.
- The recovery threshold increases by 2, so more clean successes are required to
  resolve.
- Repetitive outbox events are suppressed; timeline entries are added at
  controlled intervals rather than per result.
- Flapping is surfaced in the UI (incident list `FlappingChip`, incident header,
  and monitor detail).

Flapping state records: started at, last transition, transition count, current
observed state, suppression status, and the raised stabilization requirement.

Ordinary intermittent failures that do not meet the threshold are not labeled
flapping. Implemented in `app.evaluate_check_result` and mirrored in
`src/lib/incidents/state-machine.ts`; the `flapping` scenario in the incident lab
demonstrates containment.
