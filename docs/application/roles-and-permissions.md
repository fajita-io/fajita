# Roles and permissions

One authorization model, defined in `src/lib/auth/roles.ts`, enforced server-side in `src/lib/auth/context.ts`. UI hiding is presentation only.

## Roles

`owner` > `admin` > `member` (rank used for comparisons only, not as an ambient grant).

## Permission matrix

| Permission | Member | Admin | Owner |
| --- | :---: | :---: | :---: |
| `org:read` | yes | yes | yes |
| `members:read` | yes | yes | yes |
| `export:request` | yes | yes | yes |
| `monitors:manage` (reserved) | yes | yes | yes |
| `incidents:manage` (reserved) | yes | yes | yes |
| `status_pages:manage` (reserved) | yes | yes | yes |
| `org:update` | no | yes | yes |
| `org:update_slug` | no | yes | yes |
| `members:invite` | no | yes | yes |
| `members:remove` | no | yes | yes |
| `members:change_role` | no | yes | yes |
| `invitations:read` / `invitations:manage` | no | yes | yes |
| `audit:read` | no | yes | yes |
| `integrations:manage` (reserved) | no | yes | yes |
| `org:delete` | no | no | yes |
| `org:transfer_ownership` | no | no | yes |
| `billing:manage` (reserved) | no | no | yes |

Reserved permissions exist so later phases attach behavior without reshaping the model. They gate no interactive product surface in Phase 3.

## Guards

- `can(role, permission)` and `permissionsFor(role)` for checks.
- `canAssignRole(actorRole, target)`: owners assign admin/member; admins assign member; nobody assigns owner via role change (ownership moves only via a future transfer flow). Blocks self-promotion and privilege escalation.
- Server guards: `requireAuthenticatedUser`, `requireOrganizationMembership`, `requireOrganizationPermission`, `requirePlatformAdmin`, `requireStepUpAuthentication`.

Every mutating server action calls a guard before touching data. Role always comes from the membership row, never from client input.

## Future roles

Viewer, billing manager, and incident manager are anticipated. Add them to `ORG_ROLES`, extend the permission sets, and update `canAssignRole`. No string comparisons to refactor because there are none.
