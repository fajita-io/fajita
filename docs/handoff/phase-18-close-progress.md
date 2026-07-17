# Phase 18 close progress

**Date:** 2026-07-17  
**Classification:** Still **Not Ready**

## Closed in this pass

| ID | Change |
| --- | --- |
| LB-001 | Sentry wired (`@sentry/nextjs`, instrumentation, global-error). Set DSN in Vercel. |
| LB-002 | Env-gated enforcement; Stage-0 accepted (must enable before Stage 2). |
| LB-009 | Route tests for Stripe webhook signature/duplicate/retry semantics. |
| LB-011 | `.github/workflows/ci.yml` fails on high/critical `npm audit`. |

## Still open (critical)

| ID | What you must do |
| --- | --- |
| LB-003 | Send legal package to counsel; record approval dates. |
| LB-004 | Enable Supabase PITR/backups; restore dump into Docker or a second project; smoke the restore. |
| LB-005 | Add **Fajita** `STRIPE_SECRET_KEY` to `.env.local` / Vercel (not Learn Domains). Run `npm run stripe:seed` then `npm run stripe:verify-prices`. |
| LB-006 | After LB-005, run controlled live payment test and cleanup. |
| LB-008 | After deploy+DNS, `SMOKE_BASE_URL=https://fajita.io npm run smoke:public`, then authenticated checklist. |

## High remaining

| ID | What you must do |
| --- | --- |
| LB-007 | Add Resend (and Slack/Discord test destinations); run real alert fixtures. |
| LB-010 | Add billing/platform SQL RLS harness (backlog). |
| LB-012 | Create internal fixture status page + `status.fajita.io`. |

## Env to add (Vercel Production)

```bash
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
STRIPE_SECRET_KEY=sk_live_...   # Fajita account only
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# After prices verified + payment test:
BILLING_ENFORCEMENT_ENABLED=true
```

## Do not

- Seed Fajita products into the Learn Domains Stripe account (current MCP connection).
- Claim counsel approval without counsel.
- Enable billing enforcement before `stripe:verify-prices` passes.
