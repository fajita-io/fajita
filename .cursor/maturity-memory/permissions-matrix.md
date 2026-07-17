# Permissions matrix

Who may do what in Fajita. Governed by `security-and-privacy.mdc`. Update via `security-and-privacy-architect`. **Default: any unresolved permission is denied until explicitly designed.**

Distinct from entitlements: this matrix is authorization (may the actor perform the action at all), not entitlements (does the plan permit it). Both apply. See `entitlement-matrix.md`.

**Legend:** Yes = permitted · No = denied · Own = only own/owned records · `[UNRESOLVED]` = undecided, treated as **No** until designed

---

## Actors

- **Anonymous** visitor (not signed in)
- **Authenticated user** (signed in, no team model yet; current owner key is Clerk `user_id`)
- **Workspace member** `[UNRESOLVED]`
- **Workspace administrator** `[UNRESOLVED]`
- **Workspace owner** `[UNRESOLVED]`
- **Internal support** `[UNRESOLVED]`
- **System administrator** `[UNRESOLVED]`
- **Service process** (webhooks, jobs, server routes with service role)

## Matrix

| Action | Anonymous | Auth user | WS member | WS admin | WS owner | Support | Sys admin | Service |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Read public marketing / status page | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Read own product data | No | Own | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | Yes (scoped) | Yes (scoped) |
| Create records | No | Own | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | No | `[UNRESOLVED]` | Yes (system) |
| Update records | No | Own | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | No | `[UNRESOLVED]` | Yes (system) |
| Delete records | No | Own | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | No | `[UNRESOLVED]` | Yes (system) |
| Invite members | No | `[UNRESOLVED]` | No | `[UNRESOLVED]` | `[UNRESOLVED]` | No | No | No |
| Export data | No | Own `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` | No |
| Manage billing | No | Own | No | `[UNRESOLVED]` | `[UNRESOLVED]` | No | `[UNRESOLVED]` | No |
| Manage integrations | No | `[UNRESOLVED]` | No | `[UNRESOLVED]` | `[UNRESOLVED]` | No | `[UNRESOLVED]` | No |
| Manage API keys | No | `[UNRESOLVED]` | No | `[UNRESOLVED]` | `[UNRESOLVED]` | No | `[UNRESOLVED]` | No |
| View logs | No | No | No | `[UNRESOLVED]` | `[UNRESOLVED]` | `[UNRESOLVED]` (scoped, redacted) | `[UNRESOLVED]` | N/A |
| Administrative impersonation | No | No | No | No | No | **No** until explicitly designed and audited | **No** until explicitly designed and audited | No |

## Enforcement notes

- All permissions enforced server-side. No client-only gating (`security-and-privacy.mdc`).
- Ownership scoping (`Own`) enforced by ownership checks and Supabase RLS on user-scoped tables. RLS policies are **not yet written** on existing billing tables (gap).
- Service-process access uses the Supabase service role, server-only, and must still scope to the correct user/tenant.
- Impersonation is denied by default and remains denied until a designed, audited path exists.

## Status

Installation baseline recorded 2026-07-16. **Phase 3 resolved the organization role model (2026-07-17).**

The customer-facing tenant is the **organization**. Roles are `owner` > `admin` > `member`, defined in `src/lib/auth/roles.ts` and enforced by `src/lib/auth/context.ts` guards. The previous `[UNRESOLVED]` workspace-member/admin/owner rows now map to organization member/admin/owner. See `docs/application/roles-and-permissions.md` for the full permission matrix.

Resolved decisions:

- Read/create/update own product data: organization members per role, enforced by server guards and RLS (`app.is_org_member` / `app.has_org_role`).
- Invite members: admin/owner (`members:invite`).
- Export data: any member may request (`export:request`); org-scope requires membership.
- Manage billing: owner only (`billing:manage`, reserved for a later phase).
- Manage integrations: admin/owner (`integrations:manage`, reserved).
- View logs / audit: admin/owner (`audit:read`).
- Platform admin (internal, was "Sys admin"): explicit Clerk-id allowlist `PLATFORM_ADMIN_USER_IDS`, separate from org roles, never email-domain inferred. See `docs/security/platform-admin-foundation.md`.
- Impersonation: still **No**. Not designed or approved.

RLS is now written and enabled on all identity/tenancy tables and the billing tables (`supabase/migrations/20260717000100_phase3_rls.sql`), closing the earlier billing RLS gap for reads (writes remain service-role only).
