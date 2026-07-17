# Phase 3 database schema

Migration: `supabase/migrations/20260717000000_phase3_identity_and_tenancy.sql` (applied on project `olvnjsqspvywvwfchtuc`). Forward-only. Types are generated into `src/lib/supabase/types.ts`.

## Conventions

- `uuid` primary keys (`gen_random_uuid()`), `timestamptz` timestamps, `updated_at` maintained by the `app.touch_updated_at()` trigger.
- Check constraints on all enum-like text columns and on length-bounded text.
- Foreign keys with explicit cascade; soft-delete columns where a record must remain referenceable.

## Helper functions (`app` schema)

| Function | Purpose |
| --- | --- |
| `app.current_external_id()` | Clerk user id from `request.jwt.claims.sub` |
| `app.current_profile_id()` | caller's internal profile uuid (security definer, excludes suspended/deleted) |
| `app.org_role(org)` | caller's active role in an org |
| `app.is_org_member(org)` | active membership check |
| `app.has_org_role(org, min_role)` | role-hierarchy check |

## Tables

- **user_profiles**: `id`, unique `external_id` (Clerk), `primary_email`, `display_name`, `avatar_url`, `timezone`, `locale`, `theme_preference` (light/dark/system), `reduced_motion_preference`, `product_email_preference`, `marketing_email_preference`, `onboarding_status`, timestamps, `last_seen_at`, `deleted_at`, `suspended_at`.
- **user_preferences**: PK `user_id`. `date_format`, `time_format`, `week_start`, `default_landing`, `chart_density`.
- **notification_preferences**: PK `user_id`. `product_updates`, `changelog_digest`, `feature_announcements`, `account_activity`, `education`, `marketing`.
- **organizations**: `id`, `name`, unique `slug` (format-checked), `logo_url`, `owner_user_id`, `default_timezone`, `default_locale`, `status` (active/suspended/pending_deletion/deleted), timestamps, `deleted_at`.
- **organization_members**: `id`, `organization_id`, `user_id`, `role` (owner/admin/member), `status` (active/suspended/removed), `invited_by_user_id`, `joined_at`. Unique `(organization_id, user_id)`; partial unique index enforces one active owner per org.
- **organization_invitations**: `id`, `organization_id`, lowercased `email`, `role` (admin/member), unique `token_hash`, `invited_by_user_id`, `expires_at`, `accepted_at`, `accepted_by_user_id`, `revoked_at`. Partial unique index: one live invite per org+email.
- **organization_onboarding**: PK `organization_id`. `version`, `steps` jsonb, `use_case`, `monitoring_scope`, `service_count`, `alert_destination`, `plans_status_page`, `completed_at`.
- **audit_events**: `id`, `organization_id` (nullable for user-level), `actor_user_id`, `actor_type`, `action`, `target_type`, `target_id`, `summary`, `metadata` jsonb, `correlation_id`, `created_at`. Append-only through app code.
- **notifications**: `id`, `user_id`, `organization_id`, `category`, `title`, `body`, `href`, `read_at`, `created_at`. Indexed for unread lookups.
- **export_requests**: `id`, `organization_id`, `requested_by_user_id`, `scope`, `status`, `download_path`, `requested_at`, `completed_at`, `expires_at`.
- **deletion_requests**: `id`, `subject_type` (user/organization), `subject_user_id`, `organization_id`, `requested_by_user_id`, `status`, `scheduled_for`, `canceled_at`, `completed_at`. Check constraint ties subject_type to the correct reference.
- **feature_flag_overrides**: `id`, `flag_key`, `organization_id`, `enabled`, `note`. Unique `(flag_key, organization_id)`.

## Rollback / repair

Forward-only. To reverse, add a new migration that drops the added objects in dependency order (policies, then tables in reverse FK order, then `app` functions, then the `app` schema). Never edit an applied migration. Apply with `./scripts/supabase-push.sh`.
