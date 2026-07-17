# Application analytics: Phase 3 events

Provider: DataFast (already wired globally). Goal names live in `src/lib/analytics/goals.ts` (`DataFastGoals`). Client tracking: `trackGoal` (`src/lib/analytics/client.ts`). Server tracking: `trackGoal`/`trackServerGoal` (`src/lib/analytics/server.ts`). Params are sanitized by `sanitizeGoalParams` (max 10 keys, no PII).

## Events

| Goal name | Fired from | Metadata (allowed) |
| --- | --- | --- |
| `signup` | signup completion | plan (coarse) |
| `email_verified` | verification sync | none |
| `organization_created` | new-organization form / action | none |
| `organization_switched` | org switcher | none |
| `onboarding_started` | onboarding entry | none |
| `onboarding_step_completed` | step actions | step key (enum) |
| `onboarding_skipped` | skip optional step | step key (enum) |
| `onboarding_resumed` | re-enter onboarding | none |
| `onboarding_complete` | completion | none |
| `team_invite_initiated` | invite form open | none |
| `team_invite_created` | invitation action | role (enum) |
| `team_invite_accepted` | acceptance | none |
| `member_role_changed` | role change action | role (enum) |
| `member_removed` | removal action | none |
| `profile_updated` | profile save | none |
| `organization_updated` | org settings save | field (enum) |
| `theme_changed` | theme toggle | theme (enum) |
| `reduced_motion_enabled` | preference save | none |
| `command_palette_opened` | palette open | none |
| `notification_opened` | notification click | category (enum) |
| `security_settings_viewed` | security page | none (fired once) |
| `export_requested` | export action | scope (user/organization) |
| `deletion_flow_started` | deletion request | scope (user/organization) |
| `deletion_flow_canceled` | cancel deletion | none |

## Privacy rules (enforced)

Never send: invitation email addresses, full names, organization names, authentication tokens, secret values, support content, future monitor URLs, or IP addresses. Metadata is limited to ids and coarse enums. `sanitizeGoalParams` drops non-conforming keys and truncates values.

## Environment

Public keys `NEXT_PUBLIC_DATAFAST_*`; server keys `DATAFAST_API_KEY`, optional `DATAFAST_BOT_TOKEN`. Events are no-ops without keys, so local/test runs do not emit.
