# Alert routing

Routing decides which channels hear about an event. It is a pure, tested
function (`src/lib/alerts/routing/engine.ts`, `evaluateRouting`) so the decision
can be reasoned about and unit-tested without a database or a network.

## Inputs

- **Event context**: derived from the outbox row and the incident/monitor/
  maintenance record it points at (event type, severity, monitor, group, tags,
  correlation key, recovery flag).
- **Rules**: an organization's active routing rules with their selectors and
  target channels.
- **Org quiet windows** and **previously delivered channels** (for recovery).

## A rule

A rule is a small row plus typed selector tables. No scripting, no free-form
graph:

- **Scope**: `organization` | `group` | `tag` | `monitor`.
- **Event types**: which events match (empty means all emitted events).
- **Severities**: optional filter (empty means all).
- **Channels**: one or more targets, each with a role (`primary`, `fallback`,
  `recovery_only`).
- **Recovery behavior**, **quiet behavior**, **deduplicate**.

## Event derivation

The engine emits a compact set of raw events. The consumer derives the specific
event before routing: an `incident.opened` for a TLS incident becomes
`monitor.ssl_critical`; a heartbeat incident becomes `monitor.heartbeat_missed`;
resolutions mirror this. See `deriveEventType` in `src/lib/alerts/events.ts`.
This keeps the rule builder honest: every selectable event is one the platform
actually emits.

## Specificity: the most specific rule wins

When two rules would send to the same channel, the more specific scope wins so a
per-monitor rule can override an org-wide one:

```
monitor (10)  <  group (20)  <  tag (30)  <  organization (100)
```

Lower rank wins. A channel is delivered to at most once per event; the winning
rule supplies the human-readable explanation shown in the delivery log.

## Recovery

Recovery messages (resolved, restored, completed) are controlled per rule:

- `only_if_opened_delivered` (default): send recovery to a channel only if the
  opening alert actually reached it. No "all clear" for an alert nobody got.
- `same_channels`: always send recovery to the rule's channels.
- `never`: no recovery messages.
- `selected_channels`: only channels marked `recovery_only`.

Suppressed recovery is recorded with a reason, so the log explains the silence.

## Quiet hours

Quiet windows (org-wide and per rule) suppress or delay noise:

- Windows carry a timezone, start/end minute (cross-midnight supported), days,
  and severity/event exceptions.
- `evaluateQuiet` returns `not_quiet`, `exception_passes` (e.g. a critical
  breaks through), or `suppress_or_delay`.
- The rule's quiet behavior decides the action: `suppress` drops the alert,
  `delay` schedules it until the latest active window ends, `ignore_quiet` sends
  immediately.

## Output

`evaluateRouting` returns:

- **decisions**: channels to deliver to, each with kind (event/recovery),
  optional `scheduledAt` (delay), and an explanation.
- **suppressions**: channels intentionally not sent, each with a reason and
  explanation (recovery disabled, opening not delivered, quiet hours).
- **matchedRuleIds**: for auditing.

The consumer writes decisions to `alert_delivery_intents` and suppressions to
`alert_delivery_suppressions`. Nothing about the decision is hidden from the
operator.

## Tests

`tests/alerts-routing.test.ts` covers matching, specificity, recovery behavior,
and quiet hours. `tests/alerts-domain.test.ts` covers event derivation and quiet
window math.
