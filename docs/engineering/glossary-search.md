# Glossary search

Internal. `src/lib/glossary/search.ts` ranks exact term, acronym, synonym, prefix,
short definition, headings, then body. Synonym expansion uses `synonyms.ts`.
Queries are redacted before persistence. API: `/api/glossary/search`.
