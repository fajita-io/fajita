# Glossary platform architecture

Internal. How the public glossary is built and where each part lives.

## Summary

The glossary is a typed TypeScript content system inside the existing Next.js app.
One registry drives pages, search, sitemap entries, AI-readable files, redirects,
and editorial health checks. There is no separate glossary app and no runtime AI
generation of definitions.

## Source of truth

| Concern | Location |
| --- | --- |
| Term frontmatter | `src/lib/glossary/frontmatter.ts` |
| Term authoring | `src/lib/glossary/types.ts` (`defineTerm`) |
| Content modules | `src/lib/glossary/content/*.ts` |
| Registry | `src/lib/glossary/registry.ts` |
| Categories | `src/lib/glossary/categories.ts` |
| Synonyms | `src/lib/glossary/synonyms.ts` |
| Acronyms | `src/lib/glossary/acronyms.ts` |
| Redirects | `src/lib/glossary/redirects.ts` |
| Search | `src/lib/glossary/search.ts` |
| Serialize | `src/lib/glossary/serialize.ts` |
| Health / quality | `src/lib/glossary/health.ts` |
| Claims checks | `src/lib/glossary/claims.ts` |
| Feedback | `src/lib/glossary/feedback.ts` |

## Public routes

- `/glossary`
- `/glossary/[slug]`
- `/glossary/category/[category]`
- `/glossary/letter/[letter]`
- `/glossary/search` (noindex)
- `/glossary/updates`
- `/glossary/manifest.json`
- `/glossary/raw/[slug]` (noindex)
- `/sitemap-glossary.xml`

## Internal routes

- `/internal/glossary`
- `/internal/glossary/terms`
- `/internal/glossary/feedback`
- `/internal/glossary/stale`
- `/internal/glossary-lab`

## AI files

Root `/llms.txt` links foundational glossary URLs and the manifest.
Root `/llms-full.txt` appends approved glossary plain text after documentation.

## Attribution

Every public glossary surface renders `PoweredByWiki` linking to `https://wiki.co`
with no tracking parameters. Publisher remains Fajita.

## Validation

```bash
npm run glossary:validate
npm test -- src/lib/glossary/platform.test.ts
```
