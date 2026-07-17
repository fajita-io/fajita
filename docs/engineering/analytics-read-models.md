# Analytics read models

| Model | Table | Purpose |
| --- | --- | --- |
| Daily health | `platform_daily_health` | Command center / scorecards |
| Org health | `platform_org_health_snapshots` | Customer directory |
| Metric snapshots | `platform_metric_snapshots` | Versioned metric values |
| MRR movements | `platform_mrr_movements` | Immutable revenue movement |

Rebuild via analytics jobs. Full rebuild and backfill supported through upserts.
