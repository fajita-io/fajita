# VC demo runbook

**Date:** 2026-07-17  
**Scope:** Marketing and signup walkthrough. Not a claim of full production launch readiness.

## Story to tell

Fajita is uptime monitoring for websites, APIs, SSL certificates, and cron jobs. Accounts are open. Pricing is published. The site shows the product clearly, with docs and a reliability glossary behind it.

## Recommended path (12 minutes)

1. **Home** (`/`) — Hero, thermal stack, how-it-works demo, pricing preview with dollars, FAQ “When can I use it?” (now).
2. **Features** (`/features` or one detail page) — Stay in present tense. Interactive demos are labeled demonstration data.
3. **Pricing** (`/pricing`) — Starter $9 / Pro $19 / Business $39. Billing FAQ matches published amounts.
4. **Docs** (`/docs`) or **Glossary** (`/glossary`) — Depth signal. Skip raw research unless asked.
5. **Signup** (`/signup`) — Stop at the Clerk form unless Clerk keys and `/app` were rehearsed that morning.

## Do not click in the room

| Route | Why |
| --- | --- |
| `/status` | Honest “website reachable” page, not a dogfooded status product yet |
| `/early-access` | Redirects to signup; do not narrate waitlist |
| `/app` after signup | Only if env was rehearsed; Clerk misconfig causes redirect loops |
| `/internal/*` | Internal ops, not customer-facing |

## Pre-flight (same day)

- [ ] `npm run typecheck` and `npm test -- tests/site-content.test.ts tests/site-navigation.test.tsx tests/site-seo.test.ts` pass
- [ ] Local or production: `/`, `/pricing`, `/docs`, `/glossary`, `/signup` load
- [ ] Clerk publishable + secret keys match the instance; open signup once yourself
- [ ] Confirm homepage FAQ and pricing dollars match the story above
- [ ] Do not claim SOC 2, fabricated uptime, or “all systems operational” on `/status`

## Honest limits if asked

- Full production launch scorecard still has open critical blockers (legal counsel review, DB restore evidence, Stripe live price verification, controlled live payment test, production smoke). See `docs/readiness/launch-blocker-register.md`.
- Billing enforcement may remain off for Stage 0; do not promise hard plan gating until that flag is on and verified.
- Official Fajita status page (dogfood) is not finished; status route stays intentionally honest.
