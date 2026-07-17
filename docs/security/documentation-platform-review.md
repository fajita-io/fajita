# Documentation platform security review

Internal. Security posture of the documentation platform.

**Date:** 2026-07-17

## Content rendering

- No runtime MDX and no arbitrary imports. Pages are typed data rendered by
  server components. There is no MDX injection surface.
- Inline markup is a two-rule parser (`code`, `[label](href)`). Only internal
  and `https://` links become anchors; other schemes render as text. No raw
  HTML is interpreted.
- Code examples are inert text and never execute.

## Interactive examples

Interactive examples are client-side only over fixture data. There is no public
webhook sender and no route that accepts an arbitrary destination, so no SSRF
surface is introduced.

## Search and feedback

- Search runs server-side; queries are redacted before any logging; the corpus
  excludes drafts, internal, deprecated, and noindex pages.
- Feedback is anonymous, rate-limited, Zod-validated, and sanitized before
  storage; written feedback is not sent verbatim to analytics.

## Route exposure

- `/docs/raw/[...slug]` is allowlisted to LLM-eligible pages and disallowed in
  robots.
- `llms.txt` and `llms-full.txt` are generated only from LLM-eligible pages.
- `/internal/docs*` is platform-admin guarded and returns 404 to others
  (verified at runtime).
- `robots.txt` disallows `/api/`, `/internal/`, and `/docs/raw/`.

## Content boundaries

The validation script fails the build if the public corpus contains internal
terms, phase numbers, secret patterns, service-role strings, private IPs, or
localhost URLs. See `documentation-secret-scanning.md`.

## No open redirects

The docs platform introduces no redirect that accepts a user-controlled
destination. Deprecated-page redirects target a validated in-registry slug.

## Findings

No blocking findings. Screenshot capture is deferred; when enabled, images must
pass the same secret and PII scanning before publication.
