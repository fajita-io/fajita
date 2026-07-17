# Worker authentication

Phase 4. The worker authenticates to PostgreSQL as a dedicated, narrowly scoped
role. It never uses ordinary customer sessions and never receives broad
service-role access to unrelated tables.

## Role

`fajita_monitor_worker` is a `NOLOGIN` role (assumed via the worker's database
credentials) that has **only** `EXECUTE` on a small set of `SECURITY DEFINER`
functions in the `app` schema:

- `app.worker_register`
- `app.worker_heartbeat`
- `app.lease_due_checks`
- `app.worker_load_monitor`
- `app.finalize_check`
- `app.expire_stale_leases`
- `app.record_monitor_security_event`

It has no direct `SELECT`, `INSERT`, `UPDATE`, or `DELETE` on any monitoring
table. The functions constrain exactly what the worker can read and write. This
is the entire worker attack surface against the database.

## Credentials

- Provided via `MONITOR_WORKER_DATABASE_URL` (injected at deploy time, never
  committed)
- No secret embedded in source, no public API key, no customer anon key, no
  broadly exposed service-role key, no static secret printed in logs

## Lifecycle

| Action | Procedure |
| --- | --- |
| Provisioning | Create the DB user, grant membership in `fajita_monitor_worker`, set the connection string as a deployment secret |
| Storage | Container platform secret store only |
| Rotation | Issue new DB credentials, update the deploy secret, roll workers; old credentials revoked after drain |
| Revocation | Revoke the DB user; the role's function-only grants mean no residual table access |
| Transfer | New owner provisions their own role and credentials from the migration; no secret values are transferred in the repo |
| Compromise response | Revoke credentials, rotate the secret keyring if secret exposure is suspected, review `monitor_security_events` and worker logs |

## Contract compatibility

The worker registers its `ContractVersion`. A mismatch fails readiness so an
incompatible worker cannot corrupt data (see
`docs/engineering/worker-contracts.md`).

## Privileged activity

`SECURITY DEFINER` function calls are the only privileged operations; they are
bounded, and security-relevant events are recorded via
`app.record_monitor_security_event`.
