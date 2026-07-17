# Phase 4 handoff

What was built, what stays internal, what is deferred, and what Phase 5 needs.

## Built

- 15 monitoring tables with foreign keys, constraints, indexes, and RLS
  (`supabase/migrations/20260718000000..000200`).
- Restricted worker database interface: `fajita_monitor_worker` role +
  `SECURITY DEFINER` `app.*` functions.
- Shared versioned contracts in TS and Go (`packages/monitor-contracts`,
  `CONTRACT_VERSION = 1`).
- Go worker (`services/monitor-worker`): config, telemetry, crypto, destination
  (SSRF + DNS-rebinding), httpcheck, tlscheck, assertions, executor, lease,
  scheduler, health, testfixture, `cmd/worker`, `cmd/testfixture`.
- Secret envelope encryption (AES-256-GCM) in Go and TS, interop-verified.
- Server actions for monitor CRUD, versioning, activate/pause/resume/delete,
  secrets, heartbeat tokens, and test-before-save
  (`src/lib/app/actions/monitors.ts`, `worker-ops.ts`).
- Heartbeat ingestion route (`/api/heartbeat/[token]`), hashed tokens, rate
  limited, enumeration-safe.
- Internal engine lab (`/internal/monitor-engine-lab`) and platform-admin worker
  ops view (`/internal/monitor-engine-lab/workers`), noindex, gated.
- Full documentation set under `docs/`.

## Verified in this environment

- `npx tsc --noEmit`: passes.
- `next lint`: no new warnings.
- `vitest run`: 112 tests / 18 files pass.
- `gofmt -l`: clean. `go vet ./...`: clean. `go test -race ./...`: passes.
- `npm run build`: passes; internal routes present.
- `go build ./cmd/worker`, `./cmd/testfixture`, contracts module: build.

## Stays internal (not customer-facing)

Monitoring feature stage is `internal` (`src/lib/app/feature-flags.ts`): hidden
from customers, visible to platform admins as planned. Public claims remain
`at-launch`/private-build in the claims registry; no "available now" monitoring
claim.

## Deferred (later phases, intentionally not built)

Customer monitor wizard, incident engine, customer alerts (email/Slack/Discord/
webhook), public status pages, billing/entitlements, affiliate system, Pamphlet
chatbot, multi-region public claims, result aggregation/pruning jobs.

## Known limitations (environment)

Docker and the container platform were unavailable in the authoring environment,
so the following are authored and documented but not executed here: container
image build, image vulnerability scan, staging/production deployment, and
load/capacity testing on target infrastructure. See
`docs/testing/phase-4-load-results.md` and
`docs/handoff/monitor-worker-transfer.md`.

## Phase 5 readiness notes

- Server actions and data layers already return typed monitor summaries, results,
  and masked secret/token summaries the wizard can consume.
- `testMonitorConfigAction` provides a safe test-before-save preflight for the
  wizard.
- Feature flag `monitors` gates any customer surface; flip its stage when the
  wizard ships.
- Results and versions are attributable per execution, ready for history views.
