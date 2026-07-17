# Analytics jobs

Trigger: `POST /api/internal/platform/run` with `PLATFORM_ANALYTICS_WORKER_TOKEN`.

Jobs: `daily_health`, `org_health`. Leases/idempotency via upsert keys. Bounded batches. See `services/analytics-worker/README.md`.
