# Status page transfer (acquisition handoff)

A buyer must be able to operate status pages independently. This document lists what to transfer and how to operate.

## Domain and hosting

- Hosted zone: `status.fajita.io` (env `NEXT_PUBLIC_STATUS_PAGE_DOMAIN`). Wildcard TLS covers all hosted subdomains.
- Custom-domain routing target (CNAME): env `NEXT_PUBLIC_STATUS_CNAME_TARGET`.
- Hosting/CDN: Vercel. TLS issuance/renewal for custom domains is platform-managed.
- To transfer: move the zone and hosting project, keep the two env values pointing at the new target, re-point existing customer CNAMEs if the target changes.

## Data

- Database: Supabase project `olvnjsqspvywvwfchtuc`. Tables in `docs/database/phase-8-schema.md`, RLS in `phase-8-rls.md`.
- Public projection: `status_page_public_snapshots`. Rebuild any page by re-publishing (or calling `refreshSnapshot`).

## Operate

- Diagnose stale public data: compare `status_page_public_snapshots.generated_at` to now; re-publish to rebuild.
- Invalidate cache: publish/edit triggers `revalidatePath('/status/<slug>')`; the CDN revalidates on next request.
- Remove an abusive page: set status `suspended`/`pending_deletion` (platform admin) or unpublish; deletion removes the public snapshot.
- Transfer a custom domain: remove from the old page (frees global uniqueness), add and verify on the new page.
- Change powered-by: `poweredByVisible` display toggle; removal is entitlement-gated (`status_page_remove_powered_by`, billing not yet live).
- Add subscriber delivery: Phase 9 uses `status_page_subscribers` / `_preferences` (already present, gated).

## Environment variables

`NEXT_PUBLIC_STATUS_PAGE_DOMAIN`, `NEXT_PUBLIC_STATUS_CNAME_TARGET`, `NEXT_PUBLIC_APP_URL`. No secrets are required by the status-page product beyond the existing Supabase service role.

## Known limitations

Apex domains unsupported (subdomains only). Live TLS activation callback, background reconciliation sweep, and executed load tests are operations tasks. Subscriber email delivery is Phase 9.
