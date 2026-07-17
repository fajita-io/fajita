# Product tours

Phase 11. Optional short tours defined in `PRODUCT_TOURS`
(`src/lib/onboarding/definitions.ts`), with per-user state in
`user_onboarding`.

## Inventory

| Tour | Steps | Focus |
| --- | --- | --- |
| `monitor_detail` | up to 5 | Results, history, thresholds |
| `incident_detail` | up to 5 | Timeline, evidence, acknowledgment |
| `alert_routing` | up to 5 | Channels, rules, event selection |
| `status_page_editor` | up to 5 | Components, mapping, publishing |
| `billing_usage` | up to 5 | Plan limits and usage counters |

A unit test enforces the five-step maximum.

## Requirements honored

- User-initiated or contextually offered; never forced, never after every
  feature launch, never on public status pages.
- Dismissible at any point; state (`started`, `completed`, `dismissed`)
  persists per user through `recordTourStateAction`.
- Replays tracked separately (`replay_count`) so analytics distinguish
  first-run completion from replays.
- Keyboard accessible, screen-reader compatible, no scroll hijacking, no
  focus traps, reduced motion respected.
- Tours are lazy-loaded; none ship in the initial application bundle.

## Replay

"Replay product tour" is available from settings and tracks
`tour_replayed`. Resetting guidance never deletes resources, never resets
activation, and never resends lifecycle email.
