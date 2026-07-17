# Database restore exercise

**Date:** 2026-07-17  
**Owner:** operations  
**Environment:** production-linked project `olvnjsqspvywvwfchtuc` (read) + local dump artifact

## Result: PARTIAL (still blocking full close of LB-004)

### Completed

1. Confirmed project linked: `fajita-io` / `olvnjsqspvywvwfchtuc` / `us-east-2` / `ACTIVE_HEALTHY`.
2. Schema-only dump via `pg_dump --schema-only` using project `DATABASE_URL`.
3. Artifact (local, not committed): `/tmp/fajita-phase18-schema.sql`
4. SHA-256: `f9390a01883b8d27e3b26462a8a604d5893005683529be3f513d72f789c17c05`
5. Line count: 28245
6. Critical table row counts at dump time (empty product data, expected pre-launch):

| Table | Count |
| --- | --- |
| organizations | 0 |
| monitors | 0 |
| billing_subscriptions | 0 |
| billing_webhook_events | 0 |
| status_pages | 0 |
| platform_operator_roles | 0 |

7. Supabase Management API backup probe:

```json
{"region":"us-east-2","pitr_enabled":false,"walg_enabled":true,"backups":[],"physical_backup_data":{}}
```

### Not completed

- No isolated restore environment in this session (Docker Desktop missing; no local Postgres server; Supabase MCP auth declined).
- Point-in-time recovery is **disabled** (`pitr_enabled: false`).
- `backups` array returned empty; do not treat WAL-G flag alone as proven usable backups.
- Application smoke against a restored database not run.

### Required to close LB-004

1. Enable PITR (or confirm daily backups appear in Dashboard) on the Fajita Supabase project.
2. Restore into an isolated project or local Postgres/Docker.
3. Verify schema, migrations, RLS, row counts, secret tables remain protected.
4. Boot the app against the restore target and run smoke + reconciliation.
5. Record measured RTO/RPO in `recovery-objectives.md`.
6. Destroy the isolated environment.
