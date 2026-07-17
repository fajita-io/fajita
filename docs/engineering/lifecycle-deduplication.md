# Lifecycle deduplication

Phase 11. Duplicate lifecycle email is prevented by database uniqueness, not
in-memory state.

## Authority

`lifecycle_delivery_intents.dedup_key` is unique. `create_lifecycle_intent`
returns the existing intent on conflict instead of inserting. Key builders
live in `dedupKeys` (`src/lib/lifecycle/messages.ts`) and are pinned by unit
tests (`src/lib/lifecycle/messages.test.ts`) so scopes cannot change
silently.

## Key scopes

| Message | Scope | Effect |
| --- | --- | --- |
| `welcome` | user | One welcome ever |
| `setup_reminder` | stage (1, 2) + org + user | Exactly two reminders |
| `monitor_draft_reminder` | monitor + user | One per draft |
| `first_monitor_live` | org + user | One confirmation |
| `first_failure_education` | org + user | One education message |
| `alert_channel_reminder` | stage (1, 2) + org + user | Exactly two |
| `status_page_reminder` | org + user | One |
| `activation_complete` | org + user | One |
| `weekly_report` | org + ISO period start + user | One per org-week per recipient |
| `incident_recap` | incident + user | One per incident per recipient |
| `usage_limit_notice` | limit + threshold (80, 100) + billing period + user | One per threshold per period |
| `cancellation_confirmation` | cancellation record + user | One per cancellation |
| `pre_deletion_reminder` | deletion request + stage (7d, 1d) + user | Exactly two |
| `reactivation_reminder` | cancellation record + user | One mid-retention |

All keys embed a `v1` generation token; changing a message's semantics bumps
the generation instead of reusing old keys.

## Provider duplicates

Worker retries reuse the same intent, so a duplicate provider callback or a
worker crash after send cannot create a second intent. `reconcile
lifecycle_delivery` repairs intents stuck in `processing` without
fabricating a delivered state.
