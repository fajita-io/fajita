# Platform operations performance budget

| Surface | Target |
| --- | --- |
| Command center | < 1.5s server render with aggregates |
| Customer directory | Paginated ≤100 rows |
| Customer 360 | Lazy detail; no raw check history dump |
| Revenue | Subscription snapshot + movement aggregates |
| Check explorer | Paginated metadata only |
| Reports/exports | Background / on-demand generation |

Internal analytics must not degrade monitoring writes. Use read models.
