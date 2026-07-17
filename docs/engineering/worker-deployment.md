# Worker deployment

Phase 4. How the Go monitor worker is configured, built, and deployed. The
worker is independently deployable and does not run on Vercel.

## Build

```bash
cd services/monitor-worker
go build -o fajita-worker ./cmd/worker
```

The image is built from `services/monitor-worker/Dockerfile` (immutable, tagged
with version and commit). Container build and image scanning require Docker,
which was not available in the authoring environment; see Known limitations in
`docs/handoff/phase-4-handoff.md`.

## Configuration (environment)

All configuration is read at startup in `internal/config`. Startup fails loudly
if a critical value is missing; there are no unsafe defaults for encryption,
database credentials, worker identity, or the production environment.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONITOR_WORKER_DATABASE_URL` | yes | – | PostgreSQL connection for the worker role |
| `MONITOR_WORKER_REGION` | yes | – | Region identity stamped on every result |
| `MONITOR_WORKER_KEY` | yes | – | Stable worker key used at registration |
| `MONITOR_SECRET_KEYS` | no | empty ring | JSON `{"version":"base64-32-byte-key"}` for secret decryption |
| `MONITOR_WORKER_VERSION` | no | `0.0.0-dev` | Reported build version |
| `MONITOR_WORKER_COMMIT` | no | `unknown` | Reported build commit |
| `MONITOR_WORKER_DEPLOYMENT_ID` | no | – | Deployment identifier |
| `MONITOR_WORKER_ENV` | no | `development` | `development` or `production` |
| `MONITOR_WORKER_LEASE_SECONDS` | no | `60` | Lease duration (min 10) |
| `MONITOR_WORKER_LEASE_BATCH` | no | `20` | Max checks leased per poll |
| `MONITOR_WORKER_CONCURRENCY` | no | `16` | Concurrent executions (min 1) |
| `MONITOR_WORKER_POLL_MS` | no | `1000` | Poll interval |
| `MONITOR_WORKER_HEARTBEAT_SECONDS` | no | `15` | Heartbeat interval |
| `MONITOR_WORKER_REAPER_SECONDS` | no | `30` | Stale-lease reaper interval |
| `MONITOR_WORKER_HTTP_PORT` | no | `8080` | Health/metrics port |
| `MONITOR_WORKER_LOG_LEVEL` | no | `info` | Log level |
| `MONITOR_WORKER_USER_AGENT` | no | `Fajita-Monitor/1.0 (+https://fajita.io/monitoring)` | Outbound UA |
| `MONITOR_WORKER_METRICS_TOKEN` | no | – | Bearer token protecting `/metrics` |
| `MONITOR_WORKER_ALLOW_LOOPBACK` | no | off | Test only; rejected in production |

`MONITOR_WORKER_ALLOW_LOOPBACK=1` in production is a startup error.

## Health endpoints (`internal/health`)

- `GET /healthz` liveness: process is running
- `GET /readyz` readiness: DB reachable, config valid, contract compatible, not
  draining
- `GET /version` build metadata
- `GET /metrics` operational counters (token-protected when
  `MONITOR_WORKER_METRICS_TOKEN` is set)

## Graceful shutdown

On `SIGTERM`/`SIGINT` the worker stops accepting new leases, lets in-flight
checks finish or safely releases their leases, sends a final heartbeat with
`draining`/`offline`, and exits within the deployment's grace period.

## Regions

One production region for this phase, architected for multiple. Region identity
is stored on every result. Multi-region monitoring must not be claimed publicly
until two independent production regions run. See
`docs/handoff/monitor-worker-transfer.md`.

## Do not

Do not deploy the worker to an environment that sleeps if one-minute monitoring
is promised, do not run a dev server in production, and do not run the scheduler
from a laptop.
