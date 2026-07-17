# Lifecycle rule engine

Phase 11. Typed rules that turn product evidence into bounded lifecycle
messages. No scripting, no customer-facing automation canvas.

## Shape

Every rule is a typed function (`src/lib/lifecycle/rules.ts`):

```ts
type LifecycleRule = (ctx: RuleContext) => Promise<RuleOutcome>;
```

`RuleContext` carries the organization row, its lifecycle assessment,
activation signals, and the evaluation time. A rule may create lifecycle
delivery intents (through `createLifecycleIntent`, which enforces eligibility
and deduplication) or cancel intents that are no longer current. Rules never
send email directly.

## Registered rules

| Rule | Trigger | Bound |
| --- | --- | --- |
| `welcomeRule` | New organization | One per user, ever |
| `setupReminderRule` | No active monitor at 24h and 72h | Two stages, then silence |
| `draftReminderRule` | Monitor draft idle 24h | One per draft |
| `firstMonitorLiveRule` | First real check completed | One per org per user; adds first-failure education when the first check failed and no alert path exists |
| `alertReminderRule` | Active monitor, no verified channel at 3d and 7d | Two stages |
| `statusPageReminderRule` | Alert path ready, no published page after 7d | One |
| `activationCompleteRule` | Full activation reached | One per org per user |
| `usageLimitRule` | 80% and 100% of active-monitor limit | One per threshold per billing period |
| `cancellationLifecycleRule` | Cancellation scheduled, mid-retention, deletion at 7d and 1d | One per record and stage |

## Safety properties

- **Catch-up window**: rules ignore organizations whose trigger predates
  `CATCH_UP_WINDOW_MS`, so enabling the worker never mass-emails old
  organizations.
- **Deduplication**: every intent carries a deterministic `dedup_key`
  (see `lifecycle-deduplication.md`); the unique column is the authority.
- **Eligibility at creation and again at send time**: preference, membership,
  verification, and suppression are re-checked by the delivery worker, so a
  preference change or removal between scheduling and sending suppresses the
  message.
- **Batching**: `evaluateLifecycleBatch` selects recently active
  organizations plus any with pending deletion or scheduled cancellation, and
  processes a bounded number per pass.

## Adding a rule

Add a typed rule function, register it in `RULES`, give its message a
definition in `LIFECYCLE_MESSAGES` (class, preference, template version), a
dedup key builder, a template renderer, and a fixture. The templates test
fails until the fixture and renderer exist.
