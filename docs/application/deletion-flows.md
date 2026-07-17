# Deletion flows

Route: `/app/settings/data`. Table: `deletion_requests`. Actions in `src/lib/app/actions/account.ts`. Readiness read: `src/lib/app/account-data.ts`.

## Account deletion

- Requires step-up authentication foundation (`requireStepUpAuthentication`) plus typed confirmation in the UI.
- Ownership conflict detection: a user who owns an organization with active members cannot delete their account. `getUserDeletionReadiness` returns the blocking organizations; the user must transfer or delete them first. This prevents owner orphaning.
- Creates a `scheduled` request with a cooling-off period (7 days) instead of hard-deleting synchronously.
- Writes a `deletion.requested` audit event.
- Cancellable during the pending period (`cancelDeletionRequestAction`), which writes `deletion.canceled`.

## Organization deletion

- Allowed only with `org:delete` (owner).
- Requires step-up plus typed organization name confirmation.
- Sets the organization to `pending_deletion` and schedules deletion after the cooling-off period.
- Writes an audit event and revalidates the app layout so the pending state is reflected.
- Cancellable, which restores the organization to `active`.

## Execution

No complex tenant data is hard-deleted inside a browser request. The scheduled request is the durable record a controlled deletion worker (later phase) will act on, with hooks reserved for future monitor, status-page, and billing cleanup. Provider-account deletion is coordinated with Clerk at execution time.
