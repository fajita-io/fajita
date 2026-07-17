# Documentation content model

Internal. The typed content model that every documentation page uses.

**Date:** 2026-07-17

## Why typed content, not MDX

Pages are TypeScript objects, not MDX files. This gives one source that
serializes to three targets (rendered React, plain text for raw and LLM output,
and a search index), keeps everything type-checked, validates at build time,
and removes the MDX import and injection surface. No new dependencies were
added for authoring.

## Page shape

A page is a `DocPage` created with `defineDoc({ meta, body })`.

- `meta` is validated against the Zod frontmatter schema in
  `src/lib/docs/frontmatter.ts`.
- `body` is an array of `ContentBlock` values.

## Frontmatter fields

Required and defaulted fields include: `slug`, `title`, `description`,
`category`, `model` (`learn` | `build` | `operate` | `reference`), `pageType`
(`concept` | `task` | `reference` | `troubleshooting` | `policy` |
`migration`), `order`, `status` (`draft` | `published`), `difficulty`,
`estimatedTime`, `requiredRole`, `requiredPermission`, `requiredPlans`,
`prerequisites`, `relatedPages`, `keywords`, `searchBoost`, `lastReviewedAt`,
`owner`, `reviewers`, `productVersion`, `docsVersion`, `deprecated`,
`replacementSlug`, `noindex`, `llmInclude`.

Build-time validation rejects a published page with no owner or no review date.

## Content blocks

`ContentBlock` is a discriminated union on `kind`:

| Kind | Helper | Notes |
| --- | --- | --- |
| `heading` | `h2`, `h3` | Stable auto-derived anchor ids |
| `paragraph` | `p` | Inline markup only |
| `code` | `code(lang, src, title?)` | No execution; copy strips nothing sensitive |
| `list` | `ul`, `ol` | Inline markup per item |
| `callout` | `callout(kind, body, title?)` | note, tip, warning, security, plan, beta, deprecated |
| `steps` | `steps([{title, body}])` | Numbered task steps |
| `table` | `table(headers, rows, caption?)` | Scrollable on mobile |
| `tabs` | `tabs([{label, body}])` | Accessible tablist |
| `diagram` | `diagram(id, caption, description)` | References an in-repo SVG component |
| `screenshot` | `screenshot(sourceRoute, alt, caption, src?)` | Alt required; placeholder until captured |

## Inline markup

`inline.ts` parses a tiny subset: backtick `code` and `[label](href)`. Only
internal (`/...`) and `https://` links become anchors. Any other scheme (for
example `javascript:`) renders as literal text. No raw HTML is interpreted.

## Serialization

`serialize.ts` converts blocks to Markdown-flavored plain text used by the raw
routes and the LLM files, and `pageToPlainText` prefixes canonical URL and
version metadata. The same block tree drives the search index body text.
