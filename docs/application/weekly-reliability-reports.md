# Weekly reliability reports

Phase 11. Application views at `/app/reports` and
`/app/reports/weekly/[reportId]`; email through the lifecycle pipeline.

## Contents

Every report answers, from the immutable snapshot: what stayed healthy
(success rate, checks completed, active monitors), what failed (monitors
with failures), what was slow (p95 slowest endpoints), incidents (count,
severity, duration, resolution), certificates expiring within 30 and 7
days, late and missed heartbeats, alert delivery health, status-page
updates, and deterministic recommended actions (renew a certificate, map an
unmapped component, replace a failing channel). No speculative or
AI-generated recommendations exist.

## Settings

`organization_report_settings` (managed by users with `org:update` from the
reports page): enabled flag and week start (Monday or Sunday). Recipients
are owner-managed active members in `weekly_report_recipients`, defaulting
to the organization owner; each addition and removal is audited. Individual
recipients can still disable the report for themselves with the
`weekly_report` preference.

## Eligibility

A report emails only when the organization has an active monitor, the
period has meaningful data, the recipient is an active member with the
preference on, and no delivery for the period exists (dedup key: org +
period start + recipient).

## Honesty

Periods are exact and timezone-correct. Partial platform data is labeled
partial and excluded from success-rate denominators; missing checks are
never presented as customer downtime and perfect uptime is never
fabricated. Historical reports render from their snapshot and are never
regenerated from changed data.
