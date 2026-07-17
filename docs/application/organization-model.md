# Organization model

Fajita is multi-tenant from the foundation. The customer-facing term is **organization** everywhere. "Team" refers only to the people inside an organization.

## Tables

| Table | Purpose |
| --- | --- |
| `organizations` | Tenant record. Stable `uuid` id, unique `slug`, `owner_user_id`, `status`, timezone/locale defaults |
| `organization_members` | Membership join. `role` (owner/admin/member), `status` (active/suspended/removed), one active owner per org enforced by partial unique index |
| `organization_invitations` | Pending invitations, hashed tokens, expiry, idempotent acceptance |
| `organization_onboarding` | Org-level checklist and product context |

Internal relations use `uuid` keys. The slug is a mutable, URL-safe handle and is never the sole tenant identifier. Email is never used as identity.

## Identity bridge

Authentication authority is Clerk. Each `user_profiles` row stores `external_id` (the Clerk user id from the JWT `sub` claim). Product data is tenant-scoped through `organization_members`, not through Clerk organizations.

## Creation

First-organization flow lives outside the shell in the `(onboarding)` route group (`/app/new-organization`) to avoid an empty shell and redirect loops. It collects name, slug (auto-suggested, editable), and timezone, then continues into product onboarding. Creation is a server action that inserts the org, the owner membership, the onboarding row, and an audit event.

## Switching

`org-switcher.tsx` calls `switchOrganizationAction`, which verifies active membership before writing the `fajita-active-org` cookie and refreshing. The active org is resolved server-side each request (`resolveActiveOrg`), so stale tenant data cannot flash and a revoked or deleted org falls back safely.

## Slugs

`src/lib/app/slug.ts` normalizes (lowercase, de-accent, collapse separators), validates (length, character set, reserved words), and suggests slugs. Slug changes are a controlled settings action gated by `org:update_slug`.

## Status lifecycle

`active` -> `suspended` (access blocked) / `pending_deletion` (scheduled) -> `deleted`. Suspended and deleted organizations are unavailable through `requireOrganizationMembership`.
