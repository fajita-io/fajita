# Monitor worker transfer

Acquisition-readiness record for the monitoring engine. The system is
transferable independently of unrelated Accomplish products. No secret values
appear in the repository or in this document.

## Ownership and structure

- Repository: this repo (`fajita-io`). No new repository was created.
- Worker service: `services/monitor-worker` (Go, module
  `github.com/fajita-io/monitor-worker`).
- Shared contracts: `packages/monitor-contracts` (TS + Go).
- Database: Supabase project `fajita-io` (`olvnjsqspvywvwfchtuc`).

## Infrastructure to record at deployment

| Item | Value | Notes |
| --- | --- | --- |
| Worker hosting provider | `[set at deploy]` | Phase 0 container platform, not Vercel |
| Worker project / service | `[set at deploy]` | |
| Regions | one production region for Phase 4 | multi-region architected, not claimed |
| Container registry | `[set at deploy]` | immutable tagged images |
| Deployment process | image build → push → deploy with health checks | |
| Rollback process | redeploy previous image tag | |
| DNS resolver configuration | approved resolver | |
| Egress restrictions | platform egress policy | app-level SSRF always applies |
| Metrics provider | `[set at deploy]` | `/metrics`, token-protected |
| Logging provider | `[set at deploy]` | structured JSON, redacted |

## Database roles

- `fajita_monitor_worker`: NOLOGIN, `EXECUTE`-only on `app.*` monitoring
  functions. See `docs/security/worker-authentication.md`.

## Secrets (names and purpose only, no values)

| Secret | Purpose | Owner | Rotation | Transfer |
| --- | --- | --- | --- | --- |
| `MONITOR_WORKER_DATABASE_URL` | Worker DB connection | Platform owner | Reissue DB creds, roll workers | New owner provisions own role |
| `MONITOR_SECRET_KEYS` (worker) / `MONITOR_SECRET_KEYRING` (app) | Monitor-secret envelope keys | Platform owner | Add higher key version, re-encrypt | Transfer key material out-of-band, securely |
| `MONITOR_WORKER_METRICS_TOKEN` | Protect `/metrics` | Platform owner | Reissue | Regenerate |

Encryption-key ownership and rotation: see
`docs/security/monitor-secret-encryption.md`.

## Environment variables

Full list in `docs/engineering/worker-deployment.md`. `.env.example` documents
names and descriptions only; no secrets are committed.

## Dependencies and licenses

- Worker: `github.com/jackc/pgx/v5` and the local `monitor-contracts` module.
  Run `go list -m all` and a license audit at transfer.
- App: existing repo dependencies; no new heavy dependency added for the engine.

## Cost and capacity

Cost and sustained capacity depend on the chosen platform and must be measured
(see `docs/testing/phase-4-load-results.md`). Do not publish capacity claims
before measurement.

## Transfer checklist

1. Provision worker DB role and credentials in the target account.
2. Provision the secret keyring securely; preserve key versions.
3. Apply migrations to the target database (`supabase/migrations/`).
4. Build and push the worker image to the target registry.
5. Deploy with health checks and egress policy; verify `/readyz`.
6. Confirm contract version compatibility.
7. Run RLS and scheduler SQL tests against the target database.
8. Verify metrics and logging destinations.
9. Record all `[set at deploy]` values above.
