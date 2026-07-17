# Weekly report generation

Phase 11. Deterministic weekly reliability reports from verified product
data. No AI summaries.

## Period

`computeReportPeriod` (`src/lib/reports/weekly.ts`) finds the most recent
week-start boundary in the organization timezone (Monday by default, Sunday
configurable in `organization_report_settings`) and covers the previous
seven complete days. Bounds are timezone-correct midnights (`tzMidnightUtc`,
DST-safe). The human label is exact: "July 6 through July 12, 2026". The
browser timezone is never used. Unit tests pin all of this
(`src/lib/reports/weekly.test.ts`).

## Metric definitions (metrics version 1)

Centralized in `generateWeeklyReport`; email and application views read the
same snapshot, so definitions cannot drift.

- **Check success rate**: successful eligible scheduled checks divided by
  finalized eligible scheduled checks. Manual tests and test-before-save are
  excluded at the SQL layer (`report_check_stats` filters
  `check_executions.is_test = false`). Blocked results are excluded from the
  denominator.
- **Incident count**: incidents opened during the period.
- **Incident duration**: opened to confirmed resolution.
- **Average response time**: successful HTTP and HTTPS checks only.
- **Slowest monitors**: p95 of successful checks, labeled as p95.

## Aggregation

`report_check_stats` (SQL RPC, service-role only) aggregates per monitor in
one pass; the generator never scans raw check history from the application.
Incidents, alert intents, certificate status, heartbeat events, and
status-page state come from indexed queries bounded to the period.

## Snapshot

Each report inserts one immutable row in `weekly_reports`, unique on
`(organization_id, period_start)`, containing the full
`WeeklyReportSnapshot` json, `metrics_version`, timezone, and
`data_completeness` (`complete`, `partial`, `delayed`, `unavailable`).
Historical reports render from the snapshot and are never regenerated from
changing data. Platform issues are marked partial and are not presented as
customer downtime.

## Delivery

`generateWeeklyReportsBatch` selects organizations with at least one active
monitor and no report for the current period, generates bounded batches, and
queues one lifecycle intent per eligible recipient (owner by default, or the
owner-managed `weekly_report_recipients` list). Recipient preference
(`weekly_report`), membership, and suppression are enforced by the standard
delivery pipeline. Reports with no meaningful data are recorded but not
emailed.
