# Team management

Route: `/app/team`. Service: `src/lib/app/invitations.ts`. Actions: `src/lib/app/actions/team.ts`. UI: `src/components/app/team-manager.tsx`.

## Capabilities

- Member list with roles, gated by `members:read`.
- Invite by email with an assignable role (admin or member), gated by `members:invite`.
- Pending invitation list with resend and revoke, gated by `invitations:manage`.
- Role change via `canAssignRole`, gated by `members:change_role`.
- Member removal, gated by `members:remove`, with owner protection.
- Leave organization, blocked for the last owner.
- Every sensitive action writes an audit event.

## Invitation security

- Tokens are 32 random bytes (base64url). Only the SHA-256 hash is stored (`token_hash`). The raw token appears only in the invite link returned to the inviter.
- Expiry is enforced (default 7 days).
- One live invitation per `(organization_id, email)` via a partial unique index. Accepted/revoked rows do not block re-inviting.
- Emails are normalized (lowercased, trimmed) before storage and comparison.
- Acceptance is bound to the invited email: the accepting Clerk identity's email must match. Acceptance is idempotent.
- Existing active members are not re-invited.
- Invitation creation and resend are rate-limited.
- The invitation read path never reveals whether an unrelated email has an account.

## Acceptance flow

Public route `/app/invite/[token]` (in the `(onboarding)` group, no active org required). `invite-accept.tsx` validates the token, expiry, consumption, and email match, creates the membership, records `invitation.accepted`, then calls `switchOrganizationAction` to set the active org.

## Email delivery

No email provider is wired in Phase 3. Invitations are created as data and the shareable invite link is surfaced in the UI. The product never claims an email was sent. Wiring Resend is a later communications task.
