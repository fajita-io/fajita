# Glossary staleness

Internal. `src/lib/glossary/health.ts` marks terms past `nextReviewDue`. Cadence is
quarterly for legal/security and selected categories, otherwise semiannual or annual.
Internal route: `/internal/glossary/stale`.
