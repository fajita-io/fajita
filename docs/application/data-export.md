# Data export

Route: `/app/settings/data`. Table: `export_requests`. Action: `requestExportAction` in `src/lib/app/actions/account.ts`.

## Model

| Field | Meaning |
| --- | --- |
| `scope` | `user` or `organization` |
| `organization_id` | set for organization scope |
| `requested_by_user_id` | requester |
| `status` | `pending` -> `processing` -> `ready` / `failed` / `expired` / `canceled` |
| `download_path` | server-side location of a generated artifact (unused until generation ships) |
| `requested_at` / `completed_at` / `expires_at` | lifecycle timestamps |

## Behavior in Phase 3

Users can request an export. Organization-scope requests require `export:request` and an active organization. One in-progress request per scope per user is enforced (rate limiting). Each request writes an `export.requested` audit event.

No file is generated yet. The interface states truthfully that export preparation becomes available as records are introduced. The request model, authorization, and audit trail are complete so a generation worker attaches later without schema change.

## Security model for generated files (when implemented)

- Generated server-side, scoped to the authorized user or organization.
- Delivered via a short-lived signed URL, never public storage.
- Encrypted at rest through approved storage, logged, and removed after expiry.
- Download authorization re-checked at fetch time; no cross-user access.
