# Invitation security (internal)

Service: `src/lib/app/invitations.ts`. Actions: `src/lib/app/actions/team.ts`. Table: `organization_invitations`.

## Token handling

- Token: 32 cryptographically random bytes, base64url-encoded.
- Storage: SHA-256 hash only (`token_hash`, unique). The raw token is never persisted; it appears only in the invite link returned to the inviter.
- Lookup at acceptance hashes the presented token and matches the stored hash.

## Lifecycle

- `expires_at` enforced (default 7 days).
- Partial unique index guarantees one live invitation per `(organization_id, email)`; accepted/revoked/expired rows do not block re-inviting.
- Revocation sets `revoked_at`; resend rotates the token and extends expiry.

## Binding and idempotency

- Email normalized (lowercase, trimmed); DB check constraint enforces lowercase storage.
- Acceptance requires the accepting Clerk identity's verified email to match the invited email. This prevents an invitation from granting access to the wrong identity.
- Acceptance is idempotent: re-accepting an already-consumed invitation for the same user is a no-op success.

## Privilege and abuse controls

- Assignable roles limited to `admin` and `member`; owner cannot be granted by invitation.
- `members:invite` / `invitations:manage` permission checks server-side.
- Existing active members are not re-invited.
- Invitation creation and resend are rate-limited.
- Read path (`invitations:read`) is org-scoped; the flow never reveals whether an unrelated email has a Fajita account.

## Audit

`invitation.created`, `invitation.resent`, `invitation.revoked`, `invitation.accepted` are recorded with tenant scope and no token material in metadata.

## Deferred

Email delivery is not configured. The invite link is surfaced in the UI for manual sharing; the product does not claim an email was sent.
