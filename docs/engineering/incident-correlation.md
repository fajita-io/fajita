# Incident correlation

Phase 6 ships a conservative correlation foundation, not topology inference or
root-cause analysis.

## Correlation key

Each incident has a `correlation_key` derived from organization, primary monitor,
and failure family (`timeline`, `tls`, `assertion`, `availability`, `heartbeat`;
see `app.failure_family`). The active-incident dedup index uses this key so
repeated failures of the same family on the same monitor extend one incident
rather than opening several.

## Affected monitors

`public.incident_monitors` links additional monitors to an incident. Each link
preserves per-monitor evidence and marks one primary monitor. The incident tracks
an affected-monitor count that feeds severity.

Operators may attach a monitor, remove a monitor, set the primary monitor, and
explain the relationship. Every change is audited
(`incident.monitor_attached` / `incident.monitor_removed`) and writes a timeline
event. Cross-organization monitors cannot be attached (enforced server-side and
by scope checks in `public.incident_attach_monitor`).

## Deliberately excluded

No automatic grouping of unrelated monitors that merely failed at the same time,
no dependency graph inference, no root-cause attribution. Automatic multi-monitor
grouping (same approved component group failing within a bounded window) is
scaffolded but conservative; broad automatic correlation is intentionally
deferred.
