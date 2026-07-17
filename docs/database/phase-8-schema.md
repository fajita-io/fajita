# Phase 8 database schema

All tables target the single remote project `olvnjsqspvywvwfchtuc`. Migrations:

- `20260722000000_phase8_status_page_schema.sql` — tables + indexes
- `20260722000100_phase8_status_page_rls.sql` — RLS policies
- `20260722000200_phase8_status_page_functions.sql` — app-schema helpers
- `20260722000300_phase8_uptime_public.sql` — public uptime RPC for the projection builder

## Tables

| Table | Purpose |
| --- | --- |
| `status_pages` | Page config: ownership, slug, status, visibility, theme/appearance, display toggles, SEO, timezone, published/draft version ids, primary domain. |
| `status_page_component_groups` | Named groups (Core services, etc.), ordering, collapse default, hidden flag. |
| `status_page_components` | Customer-facing components: name, slug, description, position, calculation mode, manual status + expiry, visibility, show-uptime/response. |
| `status_page_component_monitors` | Mapping of components to Phase 4/5 monitors, with critical flag. |
| `status_page_incidents` | Attachment of internal incidents to a page with a public slug and publication state (draft/published/hidden). |
| `status_page_maintenance` | Attachment of maintenance windows with public slug and publication state. |
| `status_page_manual_messages` | General notices not tied to a monitor (title, body, type, start/end, publication state). |
| `status_page_versions` | Immutable published-config snapshots (version number, snapshot JSON, content hash, actor). |
| `status_page_domains` | Hosted subdomain + custom domains: kind, primary flag, verification status, TLS status, CNAME target. |
| `status_page_domain_verifications` | DNS TXT challenges: hashed token, record host, method, status, expiry. |
| `status_page_brand_assets` | Uploaded logo/favicon references (safe public derivatives). |
| `status_page_public_snapshots` | The only public-read projection: slug, visibility, overall status, allowlisted `data` JSON, generated_at, published_at. |
| `status_page_uptime_summaries` | Aggregated uptime rollups for retention-bounded history. |
| `status_page_subscribers` | Phase 9 foundation: normalized email, email hash, encrypted email, status, consent fields, hashed confirmation token. |
| `status_page_subscriber_preferences` | Phase 9 foundation: per-subscriber component/incident/maintenance preferences. |
| `status_page_analytics_events` | Aggregate public analytics events. |

## Conventions

- Every table carries `organization_id` for tenant scoping and RLS.
- Soft deletes via `deleted_at` / `removed_at` where history must be preserved.
- Bounded JSON only for `appearance` (safe tokens) and the versioned/snapshot payloads. Structured columns everywhere else.
- Slugs are the public identifier; internal ids never appear in public URLs.

## Uptime function

`public.status_page_component_uptime(p_org uuid, p_monitor_ids uuid[], p_since timestamptz)` — `security definer`, granted to `service_role` only. Aggregates `check_results` into daily passed/total/avg for mapped monitors. Not callable by `anon`/`authenticated`.
