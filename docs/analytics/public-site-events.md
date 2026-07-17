# Public site analytics events (Phase 2)

Provider: DataFast (Phase 0 decision). Pageviews are automatic via
`DataFastScript`; goals are declared in `src/lib/analytics/goals.ts` and
fired either declaratively (`data-fast-goal` attributes) or via
`trackGoal`/`trackGoalOnce` (`src/lib/analytics/client.ts`). Server
confirmations use `trackServerGoal`.

Rule: one mechanism per element. Elements with `data-fast-goal` have no
duplicate `onClick` tracking.

## Events

| Goal | Trigger | Properties | Purpose |
| --- | --- | --- | --- |
| `hero_cta` | Hero primary CTA click; journey final CTA (`source=journey`) | `source` | Primary conversion intent |
| `nav_cta` | Header CTA click (desktop + mobile panel) | none | Nav conversion |
| `footer_cta` | Footer CTA click | none | Late-page conversion |
| `demo_started` | First interaction with hero story or journey (once/session) | `demo` (`hero`, `journey`) | Demo engagement |
| `demo_completed` | Journey reaches final step (once/session) | `demo` | Demo completion rate |
| `plan_selected` | Plan card CTA click on pricing surfaces | `plan` | Plan intent pre-pricing |
| `contact_started` | First focus inside contact form (once/session) | none | Form funnel top |
| `contact_submitted` | Server: contact API stored the message | `topic` | Confirmed inquiry |
| `waitlist_join` | Server: early access API stored the address | `source` (`signup`, `login`, form placement) | Confirmed conversion |
| `faq_expanded` | First expansion of any FAQ item (once/session) | `question` id | Objection signal |
| `integration_viewed` | Integration card interaction | `integration` | Compatibility interest |

Client-side `signup`-adjacent events are intentionally not fired;
`waitlist_join` and `contact_submitted` are server-confirmed after the
row is stored, which is the accurate moment.

## Privacy

- No email addresses, names, or message content in goal metadata.
- Metadata is sanitized by `sanitizeGoalParams` (key pattern, 255-char
  values, max 10 keys).
- The contact API sends only the topic; the early-access API sends only
  the source label.
- No goals on hovers or animations.

## Testing

Verified in dev by watching `datafast` queue calls and in unit tests by
asserting `data-fast-goal` attributes render. Server goals log a warning
in development when `DATAFAST_API_KEY` or the visitor cookie is absent;
they no-op rather than fail the request.
