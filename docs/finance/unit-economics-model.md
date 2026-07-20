# Unit economics model (internal)

Last updated: 2026-07-20. Estimates until production cost-to-serve baselines land.

## Pricing (list)

| Plan (key) | Name | Checks/mo | Monitors | Monthly | Annual |
| --- | --- | --- | --- | --- | --- |
| starter | Core | 100K | 10 | $12 | $120 |
| pro | Team | 500K | 50 | $49 | $490 |
| scale | Scale | 2M | 150 | $99 | $990 |

Overage: $6 per 100K checks beyond allowance.

Target gross margin: 75–85% at typical usage (mid cost model).

## Cost drivers

1. Monitor checks (dominant): worker compute + egress + DB writes
2. Storage: check_results retention by plan
3. Email: Resend for alerts and subscriber fanout
4. Stripe: ~2.9% + $0.30 per charge
5. Affiliate: 15% recurring for 6 months (when applicable)

## Mid-model COGS per plan (typical usage, no affiliate)

| Plan | Typical checks | Est. COGS | Margin at list |
| --- | --- | --- | --- |
| Core | 60K | ~$3 | ~75% |
| Team | 300K | ~$12 | ~76% |
| Scale | 1.2M | ~$35 | ~65% |

Max entitlement usage can exceed these estimates. Usage UI and future enforcement protect tail risk.

## Measurement gaps (SB-004)

- Live cost/check from worker + DB attribution
- P50/P95 checks per paying org
- Storage growth by retention tier
- Resend cost per org

See `/internal/costs` when Phase 17 read models ship.
