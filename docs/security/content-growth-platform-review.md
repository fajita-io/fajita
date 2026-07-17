# Content growth platform security review

## Rendering

Articles, comparisons, tools, and research use the docs `ContentBlock` model. No MDX runtime, no arbitrary HTML, no unrestricted iframes.

## Tools

- Uptime, cron, checklist, webhook signature: browser-only
- Webhook secrets never posted to APIs or analytics
- Cron expressions never sent to analytics
- HTTP status checker deferred (SSRF / capacity separation)

## Intake

- `/api/content/feedback` and `/api/content/corrections` sanitize length, rate-limit by IP hint, and do not auto-publish
- Correction sources must be `https://`

## Drafts and internals

- Unpublished statuses are excluded from public registries used by pages
- `/internal/content*` and `/internal/content-lab` are noindex and auth-gated in production
- Raw routes set `X-Robots-Tag: noindex`

## Research privacy

- Minimum cohort threshold default 50 organizations
- No customer identifiers in research publications
- Data-insufficient is a valid public state
