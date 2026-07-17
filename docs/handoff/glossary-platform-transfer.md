# Glossary platform transfer

Internal acquisition guide.

## Operate

1. Add/edit terms in `src/lib/glossary/content/*.ts` via `defineTerm`.
2. Update synonyms/acronyms/redirects registries as needed.
3. Run `npm run glossary:validate` and `npm test -- src/lib/glossary/platform.test.ts`.
4. Build/deploy the Next.js app. SSG regenerates pages, sitemap, manifest, raw, llms.
5. Review feedback at `/internal/glossary/feedback` (platform admin).
6. Keep Powered by Wiki pointing at https://wiki.co with no parameters.

## Dependencies

Next.js app, Supabase service role for feedback tables, DataFast goals, existing
docs block renderer. No Wiki API dependency beyond the attribution link.

## Transfer checklist

- [ ] Content modules and registries
- [ ] Public and internal routes
- [ ] Supabase glossary tables
- [ ] Analytics goal names
- [ ] Validation script in CI
- [ ] Attribution component intact
