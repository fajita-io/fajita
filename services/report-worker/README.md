# Report worker (Phase 17)

Reports generate in-process via `src/lib/platform/reports/generate.ts` when an
authorized operator requests them from `/internal/reports`.

For background generation at scale, call the same module from a cron or queue
worker with `PLATFORM_ANALYTICS_WORKER_TOKEN` patterns. Exports use
`src/lib/platform/exports/service.ts` with expiring rows and column allowlists.
