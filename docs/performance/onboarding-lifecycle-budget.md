# Onboarding and lifecycle performance budget

Phase 11. Budgets are targets; measured results are recorded when a real
audit runs (`docs/testing/phase-11-load-results.md`). Nothing here is a
measured claim.

## Design properties (implemented)

- Onboarding adds no blocking work to application boot: checklist state is
  computed inside the overview page's existing server render from indexed
  queries, and milestone sync short-circuits once activated.
- Tours and the first-session flow are code-split; no tour ships in the
  initial bundle.
- Lifecycle evaluation, report generation, recap generation, and delivery
  are batched (bounded per worker pass) and never run during customer page
  requests.
- Weekly reports aggregate through `report_check_stats` (single SQL pass
  per organization) instead of scanning raw check history in the
  application.
- Report history and delivery history paginate.
- Email templates are single-file HTML with no external assets beyond
  optional images; render is pure string building.
- Leasing uses `SKIP LOCKED`, so concurrent workers cannot contend, and
  per-pass bounds provide backpressure; one organization cannot monopolize
  a pass because batches iterate organizations, not intents per
  organization.

## Budgets

| Metric | Budget |
| --- | --- |
| First-session route server render | \< 300 ms p95 |
| Checklist contribution to overview render | \< 150 ms p95 |
| Step transition (server action) | \< 400 ms p95 |
| Weekly report generation per org | \< 2 s p95 |
| Report detail page load | \< 1 s p95 |
| Incident recap generation | \< 1 s p95 |
| Lifecycle evaluation throughput | \>= 50 orgs per pass |
| Email render time | \< 20 ms per message |
| Delivery queue lag | \< 5 min at steady state |

## Measurement plan

Measure with production-shaped fixture data: seed organizations at 100,
1,000, and 5,000 scale, run the worker route per job, and record pass
durations and queue lag. Record results and dates in
`docs/testing/phase-11-load-results.md`.
