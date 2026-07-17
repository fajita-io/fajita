# Worker contracts

Phase 4. Versioned contracts shared between the web application, the database,
and the Go worker.

## Source of truth

`packages/monitor-contracts` holds the canonical definitions in two mirrored
files that must stay in sync:

- `contract.ts` (TypeScript) is imported by the web app via the `@contracts/*`
  path alias (`tsconfig.json`).
- `contract.go` (Go, module `github.com/fajita-io/monitor-contracts`) is imported
  by the worker through a `replace` directive in
  `services/monitor-worker/go.mod`.

`README.md` in that package documents the sync requirement.

## Versioning

Both files export a single version constant:

- TypeScript: `export const CONTRACT_VERSION = 1 as const;`
- Go: `const ContractVersion = 1`

Any breaking change to the shared enums or to `MonitorConfigSnapshot` bumps this
number. A worker registers its `ContractVersion`; if it does not match what the
system expects, the worker fails readiness rather than writing data with a stale
schema understanding. This prevents silent data corruption during a rollout.

## Shared definitions

- Monitor types: `http`, `https`, `api`, `ssl`, `heartbeat`
- Monitor statuses: `draft`, `active`, `paused`, `disabled`, `pending_deletion`,
  `deleted`
- Assertion types and operators (status, response time, body contains / not
  contains, header, JSON-path family, TLS validity/hostname/expiry, heartbeat)
- Result statuses: `success`, `failure`, `error`, `timed_out`, `blocked`,
  `canceled`
- Failure categories (full taxonomy in `docs/engineering/check-execution-lifecycle.md`
  and `docs/database/phase-4-schema.md`)
- Secret types: `authorization_header`, `api_key`, `bearer_token`, `basic_auth`,
  `custom_header`
- Worker statuses: `starting`, `healthy`, `degraded`, `draining`, `offline`
- Security event types
- Allowed schemes (`http`, `https`) and allowed ports (`80`, `443`)
- `MonitorConfigSnapshot`, including `check_interval_seconds` so the worker can
  compute drift-free next ticks without an extra query

## Do not

Do not redeclare these enums independently in the app or worker. Import from the
contract package so a change in one place fails typechecking or the build in the
other, rather than diverging silently.
