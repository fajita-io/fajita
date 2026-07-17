# Documentation versioning

Internal. How documentation versions, review dates, and deprecation work.

**Date:** 2026-07-17

## Version fields

Every page carries `docsVersion` (independent of app deploys), `productVersion`
(the product release the content describes), and `lastReviewedAt`. `DOCS_VERSION`
in `src/lib/docs/frontmatter.ts` is the current corpus version and appears in
`llms.txt`, `llms-full.txt`, the manifest, and each raw page header.

## When product behavior changes

1. Update the affected content.
2. Update `productVersion` (and `docsVersion` if the corpus changes).
3. Run `npm run docs:validate`.
4. Update screenshots if the UI changed.
5. Rebuild (regenerates search, sitemap, LLM files, manifest).
6. Add a redirect if a route changed.
7. Record a documentation changelog entry.

## Deprecation

A deprecated page sets `deprecated: true` and `replacementSlug`. The build
throws if the replacement does not exist. Deprecated pages:

- show a banner linking to the replacement (`components/docs/page-meta.tsx`);
- are excluded from primary navigation ordering where appropriate and flagged
  in the sidebar;
- are excluded from the sitemap and the AI corpus;
- remain reachable so inbound links do not break.

## Review cadence

Cadence is risk-based (see `documentation-content-boundaries.md` and the phase
handoff). High-risk areas (billing, webhook security, subscriber consent,
account deletion, security) review after each related change and at least
quarterly; medium-risk every six months; low-risk annually. `health.ts` flags
pages that exceed cadence for the internal ops view.
