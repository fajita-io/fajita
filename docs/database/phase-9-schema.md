# Phase 9 database schema

Migrations:

- `20260723000000_phase9_subscriber_schema.sql` tables + status-page settings
- `20260723000100_phase9_subscriber_engine.sql` atomic SQL functions
- `20260723000200_phase9_subscriber_rls.sql` RLS
- `20260723000300_phase9_subscriber_link_token.sql` `link_token_version`
- `20260723000400_phase9_consent_events.sql` consent event vocabulary

## status_page_subscribers (extended)

Lifecycle `status`: `pending`, `confirmed`, `unsubscribed`, `bounced`,
`complained`, `suppressed`, `pending_deletion`, `deleted`. Adds consent fields
(`consent_text_version`, `consent_ip_hash`, `consent_user_agent_summary`),
confirmation fields (`confirmation_expires_at`, `confirmation_sent_at`,
`confirmation_resend_count`, `last_confirmation_resend_at`), delivery fields
(`bounced_at`, `complained_at`, `last_delivery_at`, `soft_bounce_count`),
`suppression_reason`, `encryption_key_version`, `deletion_requested_at`,
`source`, and `link_token_version`.

## New tables

- `status_page_subscriber_event_prefs` one row per subscriber: all_components,
  incident/maintenance event toggles.
- `status_page_subscriber_components` selected component ids.
- `status_page_subscriber_consent_records` append-only consent trail.
- `status_page_subscriber_events` the fan-out source (allowlisted public
  payload, idempotency key, fan-out status/count).
- `status_page_subscriber_delivery_deduplication` uniqueness guard.
- `status_page_subscriber_delivery_intents` planned sends (frozen render
  payload, match explanation, retry state).
- `status_page_subscriber_delivery_attempts` per-attempt outcomes.
- `status_page_subscriber_delivery_dead_letters` exhausted failures.
- `status_page_subscriber_delivery_suppressions` per-event suppression with
  explanation.
- `status_page_subscriber_suppressions` durable per-address suppression (hash).
- `status_page_subscriber_provider_events` verified callback records.
- `status_page_subscriber_preference_tokens` (present; routine access now uses
  stateless signed tokens, so this is reserved for specific revocation needs).
- `status_page_subscriber_import_jobs`, `status_page_subscriber_export_jobs`
  (tables present; UI/processing deferred).

## status_pages settings columns

`subscriptions_enabled`, per-event `subscriber_*_enabled`,
`subscriber_component_selection_enabled`, `subscriber_all_components_default`,
`subscriber_confirmation_cooldown_seconds` (30..3600),
`subscriber_reply_to` (+ `_verified`), `subscriber_privacy_url`,
`subscriber_public_count_visible`, `subscriber_powered_by_removed`,
`subscriber_form_auto_paused_at`, `subscriber_form_pause_reason`.

## SQL functions

`app.*` (security definer) with `public.*` wrappers granted to `service_role`:
`claim_subscriber_events`, `next_subscriber_fanout_batch`,
`create_subscriber_intent`, `record_subscriber_suppression`,
`mark_subscriber_event`, `lease_subscriber_deliveries`,
`record_subscriber_attempt`, `expire_stale_subscriber_leases`,
`cancel_pending_subscriber_intents`, `suppress_subscriber`,
`apply_subscriber_provider_event`, `reconcile_subscriber_delivery`.
