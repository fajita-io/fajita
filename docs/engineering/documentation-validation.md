# Documentation validation

Internal. The checks that gate documentation quality and safety.

**Date:** 2026-07-17

## Load-time integrity (`registry.ts`)

Runs whenever the registry is imported (build, tests, dev):

- duplicate slug throws;
- deprecated page with a missing `replacementSlug` throws;
- unresolved `relatedPages` are dropped with a warning outside production.

## Validation script (`scripts/docs-validate.ts`)

Run with `npm run docs:validate`. Exits non-zero on any error:

- published pages have an owner, a review date, and a usable description;
- every `relatedPages` entry resolves;
- every internal `/docs/...` link in prose resolves;
- every screenshot has alt text;
- the AI corpus is only published, indexable, LLM-eligible pages;
- the corpus contains no em dashes, phase numbers, internal terms
  (`cursor`, `supabase`, `clerk`), Stripe or webhook secret patterns, service-
  role strings, private IPs, or localhost URLs.

## Unit tests (`src/lib/docs/platform.test.ts`)

- registry loads, unique slugs, related pages resolve, frontmatter validates;
- navigation groups by model; prev/next covers ordered public slugs;
- AI corpus exclusion invariants;
- webhook signature examples verified against the real signer
  (`src/lib/alerts/signing.ts`): accepts a genuine signature, rejects tampering,
  rejects a stale timestamp;
- search ranking, synonyms, typo tolerance, error-query precedence;
- query redaction of emails, URLs, and secret-like tokens;
- inline parser rejects unsafe link schemes.

## Results at phase close

Typecheck clean, lint warnings only, `docs:validate` passes (70 pages),
`npm test` 24 files / 209 tests pass, production build succeeds with
`/docs/[...slug]` and `/docs/raw/[...slug]` prerendered as SSG.
