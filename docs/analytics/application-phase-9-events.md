# Phase 9 analytics events

Subscriber analytics track **operational** behavior. They never include an email
address, email hash, confirmation token, preference token, subscriber id,
incident/maintenance title, public message content, or provider message id.
Open tracking is not implemented.

## Customer product events (authenticated app)

Emit via `trackServerGoal` / `trackGoal` with bounded, non-PII metadata:

- `subscriber_form_enabled` / `subscriber_form_disabled`
- `subscriber_settings_updated`
- `subscriber_page_viewed`
- `subscriber_imported` (deferred until import ships)
- `subscriber_export_requested` (deferred until export ships)
- `email_preview_opened` (deferred until preview UI ships)
- `test_subscriber_email_sent` (deferred until test send ships)
- `subscriber_delivery_viewed`
- `subscriber_complaint_viewed` / `subscriber_bounce_viewed`
- `subscriber_suppression_created`
- `subscriber_manual_redelivery_requested`
- `subscriber_confirmation_resend_initiated`
- `subscriber_preference_configuration_changed`

## Public funnel events (aggregate only)

- `subscription_form_submitted`
- `confirmation_completed`
- `preference_center_opened`
- `preferences_updated`
- `unsubscribe_completed`

## Implementation status

Goal names must be added to `DataFastGoals` in `src/lib/analytics/goals.ts`
before use, and must never collide with reserved payment goal names. In this
pass the pipeline (events, fan-out, delivery, callbacks, public flows) is built
and audited via the app audit log; wiring each DataFast goal call into the UI is
tracked as a remaining task in the Phase 9 handoff. The audit log
(`recordAuditEvent`) already captures form enable/disable, settings changes,
operator unsubscribe, and suppression.
