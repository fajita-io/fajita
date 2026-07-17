# Documentation analytics events

Internal. Typed DataFast goals for the documentation platform and their privacy
rules. Defined in `src/lib/analytics/goals.ts`.

**Date:** 2026-07-17

## Goals

| Goal constant | Event name | Fired |
| --- | --- | --- |
| `docsSearchOpened` | `docs_search_opened` | Search dialog opened |
| `docsSearchSubmitted` | `docs_search_submitted` | A query was run |
| `docsSearchNoResult` | `docs_search_no_result` | A query returned nothing |
| `docsSearchResultSelected` | `docs_search_result_selected` | A result was chosen |
| `docsFeedback` | `docs_feedback` | Page feedback submitted |
| `docsCodeCopied` | `docs_code_copied` | A code block was copied |

Pageviews are captured globally by the existing DataFast script; they are not
re-emitted here.

## Metadata rules

Events carry only coarse, non-sensitive metadata: a length bucket for search,
the selected result slug, page slug, helpful flag, reason enum, docs version,
and product version. They never carry raw query text beyond a length bucket,
page content, user email, organization name, monitor URL, secrets, incident
content, subscriber data, affiliate data, or billing data.

## Redaction

Server-side search redacts the query (`redactQuery`) before logging a no-result
event, so credential-like strings, emails, and URLs never reach analytics or
the `docs_search_no_result` table.

## Where fired

Client goals: search and code-copy in `components/docs/search.tsx` and
`components/docs/code-block.tsx`. Server goal: no-result logging in
`/api/docs/search`. Feedback is recorded server-side via `/api/docs/feedback`.
