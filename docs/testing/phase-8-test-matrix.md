# Phase 8 test matrix

## Automated (shipped)

`tests/status-pages.test.ts` (vitest) covers pure logic:

- Public component state: verification private by default, down-critical → major outage, unknown → not an outage, calculation modes, manual override, empty component.
- Overall state: calculated (not hardcoded), maintenance never hides an unrelated outage, maintenance surfaces only when nothing worse, badge vocabulary.
- Sanitization: control-char stripping, length clamp, no script/img tags emitted, safe-URL allowlist, bold/link rendering with safe rel.
- Subdomain validation: reserved words, platform impersonation, normal slug, fallback suggestion.
- Custom domain normalization: subdomain-only, scheme/path stripping, fajita.io blocked, non-ASCII rejected.
- Appearance contrast: low-contrast blocked, accessible accepted, ratio sanity.
- Fixtures: deterministic, ≥ 20 scenarios, no "internal"/"secret" strings in the public payload.

Run: `npm test`. Type check: `npm run typecheck`. Lint: `npm run lint`.

## Security matrix (design-verified via RLS + projection)

Cross-tenant page/monitor/incident/maintenance access blocked by org-scoped RLS; anonymous access to internal tables blocked (no anon policy); public projection allowlist; internal notes/secret URLs/customer emails excluded; domain takeover and duplicate-domain prevention; DNS token hashing; TLS-state forgery blocked (customers cannot write); content sanitization (script/CSS/unsafe-URL/phishing-form); public API and badge rate limiting.

## Functional matrix

Creation (draft, hosted subdomain, duplicate/reserved rejection, timezone, component, mapping, preview, publish, resume); components (create/edit/reorder/group/hide/delete, manual/automatic/multi-monitor, deleted monitor); incidents (draft projection, manual publish, update, resolution, correction, archive, internal-note exclusion); maintenance (publish/start/update/complete/cancel, outage overlap); domains (hosted, custom request, DNS verify, TLS provisioning state, primary, redirect fallback, removal); appearance (theme, logo, accent, contrast validation, dark/light, powered-by, preview, versioning); public rendering (all states, stale projection, no-JS, cache miss, custom/hosted, mobile); versioning (draft, publish, previous preserved, rollback).

## Accessibility matrix

Keyboard nav, landmarks, overall-status announcement, non-color component labels, incident timeline, uptime bar SR summary, maintenance times, theme contrast, form labels, domain instructions, publish dialog, preview, 200% zoom, reduced motion, no color-only states. Internal lab (`/internal/status-page-lab`) renders every state, theme, and viewport for manual QA.

## Deferred test execution

Live staging custom-domain + TLS test, executed load test, and browser/field CWV runs require a deployed staging environment with the CDN; see `phase-8-load-results.md`. Not fabricated.
