# Status page security review

## Trust boundaries

| Boundary | Control |
| --- | --- |
| Customer session → data | RLS `SELECT` only, org-scoped; all writes via service role after TypeScript permission check. |
| Internal data → public | Single path through `status_page_public_snapshots`, allowlisted fields only. |
| Anonymous → tables | No `anon` policy on any status-page table; public renderer uses service role server-side. |
| Cross-tenant | Every policy and query gates on `organization_id`. |
| Customer content → HTML | Sanitized (`sanitize.ts`): plain text plus a tiny safe inline subset; no script/style/iframe/form/data:/javascript:. |

## Permissions

`status_pages:manage` (build/edit) and `status_pages:publish` (publish, domains, incidents/maintenance, rollback, delete). Centralized in `src/lib/auth/roles.ts`; checked in every server action.

## Rate limiting

Every server action is rate-limited per actor and bucket (`limitOrThrow`). Public API and badge endpoints are rate-limited per client key.

## What can never leak

Internal notes, internal incident titles, assignees, acknowledgment, monitor ids/names, secret URLs, evidence, worker/region detail, audit events, alert-delivery history, subscriber emails, page passwords, private-link tokens.

See `status-page-public-private-boundary.md`, `status-page-domain-security.md`, and `status-page-abuse-prevention.md`.
