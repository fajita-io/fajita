# Analytics worker (Phase 17)

Triggers bounded platform analytics jobs via the Next.js internal API.

## Jobs

| Job | Endpoint body | Purpose |
| --- | --- | --- |
| `daily_health` | `{ "job": "daily_health" }` | Upsert `platform_daily_health` for today |
| `org_health` | `{ "job": "org_health", "limit": 100 }` | Snapshot organization health rows |

## Auth

```bash
curl -X POST "$APP_URL/api/internal/platform/run" \
  -H "Authorization: Bearer $PLATFORM_ANALYTICS_WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job":"daily_health"}'
```

Unset `PLATFORM_ANALYTICS_WORKER_TOKEN` disables the route (404).

## Rules

- Never run on customer request paths
- Bounded batches only
- Idempotent upserts
- No secrets in job payloads
