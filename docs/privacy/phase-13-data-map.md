# Documentation platform data map

Internal. Data the documentation platform collects and how it is handled.

**Date:** 2026-07-17

## Data collected

| Data | Where | Identity | Retention intent |
| --- | --- | --- | --- |
| Page views | DataFast (aggregate) | None | Aggregate trends |
| Search opened/submitted/selected | DataFast (aggregate) | None | Aggregate trends |
| No-result queries (redacted) | `docs_search_no_result` | None | Prune raw quickly; keep trends |
| Page feedback | `docs_feedback` | None | Until resolved plus bounded period |
| Code-copy, link-copy events | DataFast (aggregate) | None | Aggregate trends |
| LLM/raw requests | Server logs / analytics (aggregate) | None | Aggregate trends |

Public documentation requires no account and sets no user identity.

## Minimization and redaction

- Search queries pass through `redactQuery` before any logging: emails, URLs,
  and credential-like tokens become placeholders; length is capped.
- Feedback comments are sanitized before storage and are not sent verbatim to
  third-party analytics.
- No fingerprinting. No sale of docs usage data. No cross-site advertising use.

## Never collected on public docs

User email, organization name, monitor URL, secrets, incident content,
subscriber data, affiliate data, billing data.

## Storage

`docs_feedback` and `docs_search_no_result` are Supabase tables with RLS enabled
and no anon policies; only the server-side service client writes them. See the
migration `supabase/migrations/20260727000000_phase13_docs_platform.sql`.

## Retention

Aggregate search and usage trends are retained. Raw redacted no-result queries
are pruned quickly. Feedback is retained until resolved plus a bounded period.
Published documentation versions and redirect history are preserved. Exact
periods are set with the platform retention policy.
