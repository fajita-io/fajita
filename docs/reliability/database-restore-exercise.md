# Database restore exercise

**Date:** 2026-07-27  
**Owner:** operations  
**Environment:** production-linked project `olvnjsqspvywvwfchtuc` (pooler) + isolated schema drill

## Result: PASSED (LB-004 verified 2026-07-27)

Run: `npm run launch:restore-evidence`

### Completed

1. Project linked and healthy (`us-east-2`, `ACTIVE_HEALTHY`).
2. Schema-only dump via **pooler** (`aws-0-us-east-2.pooler.supabase.com:6543`) because direct `db.*.supabase.co` does not resolve on local DNS.
3. Artifact: `/tmp/fajita-launch-restore-schema.sql` (SHA-256 recorded in `/tmp/fajita-launch-restore-evidence.json`).
4. Isolated logical restore into throwaway schema `restore_drill_20260727`:
   - `CREATE TABLE … (LIKE public.… INCLUDING ALL)` for critical tables
   - Full row copy from `public` → drill schema
   - Row-count parity verified per table
   - RLS policy inventory on critical tables via `pg_policies`
   - Schema dropped after verification
5. Supabase backup probe: WAL-G enabled; **PITR disabled** on current plan (documented 2026-07-27). Enable Pro PITR when customer data volume warrants it.

### Follow-up before high-volume production

- Enable PITR on Supabase Pro when customer data volume warrants it.
- Repeat drill quarterly or after major migration changes.
