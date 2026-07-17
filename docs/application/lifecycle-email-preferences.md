# Lifecycle email preferences

Phase 11. User-level control over optional lifecycle messages, at
`/app/settings/notifications` with delivery history at
`/app/settings/notifications/history`.

## Controls

Stored per user in `lifecycle_email_preferences`:

| Preference | Default | Covers |
| --- | --- | --- |
| `setup_guidance` | on | Setup, draft, alert, and status-page reminders; first-failure education |
| `weekly_report` | on | Weekly reliability report |
| `incident_recaps` | on | Post-incident recaps |
| `usage_notices` | on | 80% and 100% usage notices |
| `reactivation_reminders` | on | Mid-retention reactivation reminder |

Required service messages (cancellation confirmation, pre-deletion
reminders, export and deletion notices) cannot be disabled and say so.

## Enforcement

Preferences are enforced twice: when an intent is created and again at send
time in the delivery worker. Disabling a preference also cancels pending
intents for that class (`updateLifecyclePreferencesAction` calls
`cancelLifecycleIntents`). Changes are audited
(`lifecycle.preferences_changed`).

## Separation

Lifecycle preferences are separate from status-page subscriber preferences
(Phase 9, public visitors) and from team incident alert routing (Phase 7).
The notifications page presents them as distinct sections so the three
systems are never conflated.

## Suppression

Hard bounces, complaints, and manual suppressions live in
`lifecycle_suppressions` and silence all optional classes regardless of
preference. The history page shows the user's own deliveries with status,
attempts, and suppression reasons; no provider credentials and no other
users' messages.
