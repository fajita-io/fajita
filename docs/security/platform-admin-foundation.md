# Platform-admin foundation (internal)

## Assignment

Platform access uses two layers:

1. **Bootstrap owners** — `PLATFORM_ADMIN_USER_IDS` (comma-separated Clerk user ids) receive `platform_owner`. Empty allowlist means nobody is bootstrapped.
2. **Graded roles** — `platform_operator_roles` rows grant roles such as `operations`, `support`, `billing_operations`, `security`, `privacy`, `read_only_analyst`, and `auditor`.

There is no password, no shared admin account, and no email-domain inference.

## Separation from organization roles

Platform roles are entirely separate from `owner`/`admin`/`member`. Owning a customer organization does not grant ops access. Permissions are centralized in `src/lib/platform/permissions.ts` and enforced via `requirePlatformPermission`.

## Guards

- `requirePlatformAccess()` / `requirePlatformPermission(permission)`
- `requirePlatformAdmin()` remains for legacy affiliate/worker actions (bootstrap allowlist)
- `requireStepUpAuthentication()` / `requireStepUpForAction()` for high-risk work when `FAJITA_ENFORCE_STEP_UP=1`
- Internal layout returns `notFound()` when access is denied

## Surfaces

- Founder command center and ops OS under `/internal/*`
- Existing domain ops (affiliates, support, content, lifecycle, labs) integrated into the ops shell
- `robots.txt` disallows `/internal/`; pages are `noindex`; absent from `llms.txt`

## Auditing

Privileged actions use `logPlatformAdminAction` → `audit_events` with `actor_type = 'platform_admin'`. Step-up events recorded in `platform_step_up_events`.

## Explicitly not built

- Unrestricted customer impersonation (disabled by design)
- Arbitrary SQL, shell, or secret rendering
- Autonomous refunds, payouts, deployments, or migrations
- Portfolio-wide Accomplish administration

## Transfer

1. Add/remove Clerk ids in `PLATFORM_ADMIN_USER_IDS`, and/or
2. Insert/revoke `platform_operator_roles` rows
3. Rotate `PLATFORM_ANALYTICS_WORKER_TOKEN` and other worker tokens

Document current holders in the private runbook, not in the repo.
