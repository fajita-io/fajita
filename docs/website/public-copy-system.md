# Public copy system (Phase 2)

## Where copy lives

All customer-facing copy sits in typed content sources, not scattered
through components:

| Content | File |
| --- | --- |
| Site constants, CTA labels, launch state, contact topics | `src/lib/site/site-config.ts` |
| Feature pages (headlines, facts, use cases, objections) | `src/lib/site/features.ts` |
| Pricing plans, comparison rows, unpublished note | `src/lib/site/pricing.ts` |
| FAQs (home + billing) | `src/lib/site/faq.ts` |
| Integrations | `src/lib/site/integrations.ts` |
| Changelog entries | `src/lib/site/changelog.ts` |
| Roadmap items | `src/lib/site/roadmap.ts` |
| Legal document registry | `src/lib/site/legal.ts` |
| Claim statements | `src/lib/site/claims.ts` |

Page-level section copy (hero, problem, detection, etc.) lives in the
page files themselves, since it is composition-specific.

## Voice

Confident, specific, calm. Outcome before feature. Short lines that
land. Serious technical language alongside campaign language.

## Hard rules (test-enforced in `tests/site-content.test.ts`)

- No em dashes or en-dash pauses anywhere customer-facing.
- Banned words: revolutionize, leverage, seamless(ly), game-changing,
  cutting-edge, supercharge, unlock, robust, next-generation, harness,
  effortlessly, all-in-one platform, AI-powered.
- No lorem ipsum.
- No fabricated numbers, customers, testimonials, or logos.

## Metaphor budget

Heat lives in marketing headlines only, one appearance per page
maximum, and never twice in one line. Alerts, status pages, incident
copy, forms, and errors are plain and factual
(see `docs/brand/fajita-verbal-identity.md`).

Current heat lines in production copy:

- Hero: "Know when your software gets too hot." / "starts cooking"
- Footer CTA: "Keep the stack sizzling. Stop it from burning."
- SSL feature: "Do not let a certificate expire in public." (no heat)
- 404: "This page left the heat." / "no longer cooking"

## Plan naming decision

Playful names (Sizzle, Skillet, Kitchen) were considered and rejected:
Starter, Pro, and Business already exist in the Stripe configuration
(`src/lib/stripe/plans.ts`), are instantly decodable, and renaming would
create drift between billing and marketing. The audience lines carry the
personality instead.
