# Phase 8 row-level security

Migration: `20260722000100_phase8_status_page_rls.sql`. Trust model matches Phases 4-7.

## Rules

- **Customer sessions (`authenticated`)** get read-only, org-scoped `SELECT` on management tables via `app.is_org_member(organization_id)`. This lets the app render dashboards.
- **No customer writes.** There are no `INSERT`/`UPDATE`/`DELETE` policies for `authenticated`. Every write goes through the service role after an explicit TypeScript permission check (`status_pages:manage` / `status_pages:publish`). Customers cannot write config, publication state, domain verification, TLS status, versions, snapshots, or subscriber records directly.
- **Anonymous public rendering does not read these tables.** The public renderer reads `status_page_public_snapshots` server-side with the service role. That table has RLS enabled with **no `anon` policy**: invisible to anonymous and to cross-tenant authenticated callers. Authenticated members may read their own org's snapshot for preview.
- **Subscriber tables:** no `anon` access ever; reads require a future explicit permission. Emails are never exposed publicly.
- **Cross-tenant protection:** all policies gate on `organization_id`. A member cannot map another org's monitors, attach another org's incidents/maintenance, or read another org's snapshot.

## Verification

`supabase migration list --linked` confirms all four Phase 8 migrations are applied. RLS is enabled on all fourteen status-page tables (see the `alter table ... enable row level security` block).

## Tested invariants (see `docs/testing/phase-8-test-matrix.md`)

- Anonymous cannot read any authenticated status-page table.
- The public snapshot excludes internal notes, monitor names, secret URLs, assignees, and subscriber emails.
- Uptime RPC is `service_role`-only.
