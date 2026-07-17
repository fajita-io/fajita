# Customer health foundation

Phase 11. Transparent, rule-based health signals. No opaque scoring, no AI,
no behavioral profiling.

## Signals

Health is the lifecycle state (`docs/engineering/lifecycle-state-model.md`)
plus its recorded reasons. Every input is a product fact the customer can
see themselves:

- **Healthy**: active monitors, recent successful checks, verified alert
  channel, published status page, recent authenticated activity, no payment
  issue. Maps to `activated` or `engaged`.
- **Setup stalled**: signup completed, no active monitor after the stall
  window. Maps to `setup_stalled`.
- **At risk**: all monitors paused, failing alert channel, long inactivity
  after activation, repeated billing issues, or scheduled cancellation.
  Maps to `at_risk`, `payment_issue`, or `cancellation_scheduled`.

The `reasons` array on `lifecycle_states` records exactly which evidence
produced the state, so any classification can be explained.

## Permitted uses

- Contextual setup prompts in the application.
- Operational lifecycle reminders (bounded, preference-respecting).
- Internal aggregates in `/internal/lifecycle`.
- Support prioritization later.

## Prohibited uses

- Public or customer-visible labels.
- Pricing discrimination.
- Advertising or third-party sharing.
- Any AI-derived score presented as health.
