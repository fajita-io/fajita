# monitor-contracts

Canonical shared contracts for the Fajita monitoring engine. Two mirrors, one
vocabulary:

- `contract.ts` — TypeScript source consumed by the Next.js application
  (imported as `@contracts/contract`).
- `contract.go` — Go package (`github.com/fajita-io/monitor-contracts`) consumed
  by the worker via a `replace` directive.

Both define monitor types, statuses, assertion types, operators, result and
failure taxonomies, worker states, allowed schemes/ports, and the shared
`CONTRACT_VERSION` / `ContractVersion`.

## Version compatibility

`ContractVersion` is bumped on any breaking change to these enums or to the
worker database functions in `supabase/migrations`. The worker registers its
contract version (`monitor_workers.contract_version`). A worker whose contract
version does not match the deployed database contract fails readiness instead of
executing, so a mismatched deploy cannot corrupt data. See
`docs/engineering/worker-contracts.md`.

## Keeping the mirrors in sync

`contract.ts` and `contract.go` must stay identical in meaning. Drift is a
release blocker. When you edit one, edit the other in the same change and bump
the version if the change is breaking.
