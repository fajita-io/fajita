# Documentation feedback

Internal. Page-level feedback capture and handling.

**Date:** 2026-07-17

## Reader experience

Each page ends with "Was this page helpful?" with Yes and No. Choosing No
reveals structured reasons (could not find the answer, steps unclear, product
did not match, example failed, page outdated, other) and an optional short
written comment with a no-secrets notice. No login is required.

## Safety

- Anonymous submissions are rate-limited in-memory at `/api/docs/feedback`.
- Input is Zod-validated and comments are sanitized (`sanitizeComment`) before
  storage.
- Written feedback is not sent verbatim to third-party analytics.

## Storage

Feedback is written server-side to `docs_feedback` (Supabase, RLS on, service
client only) with page slug, helpful flag, reason, sanitized comment, docs
version, and product version. No customer identity is attached.

## Operations

`/internal/docs/feedback` (platform-admin only) lists recent feedback for
review. The editorial workflow assigns, resolves, and records a changelog entry.
The queue is not a public ticketing system.
