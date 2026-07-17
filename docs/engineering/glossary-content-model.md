# Glossary content model

Internal. Terms use `defineTerm` with Zod frontmatter and typed docs `ContentBlock`s.
Required sections are assembled via `buildTermBody`. Optional FAQs and formulas attach beside the body.
See `src/lib/glossary/frontmatter.ts` and `src/lib/glossary/authoring.ts`.
