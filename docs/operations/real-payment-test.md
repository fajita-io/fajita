# real payment test

**Date:** 2026-07-17  
**Owner:** operations  
**Prerequisite:** `npm run stripe:production-ready` shows `charges_enabled` OK (Stripe account review complete).

## Status: NOT RUN (LB-006)

Controlled live payment: checkout → customer → subscription → invoice → payment → webhook → Fajita state → entitlements → receipt → portal → cancel → optional refund → affiliate exclusion → cleanup.

## Steps (live)

1. Confirm audit passes: `npm run stripe:production-ready`
2. Sign in to production Fajita as a test org owner with `billing:manage`
3. Start checkout for **Core** monthly from `/app/settings/billing` or pricing CTA
4. Pay with a real card (or Stripe test card only in test mode)
5. Confirm:
   - Redirect to `/billing/checkout/success`
   - Row in `billing_subscriptions` for the org
   - `billing_webhook_events` shows `checkout.session.completed`, `customer.subscription.created`, `invoice.paid`
   - Entitlement snapshot reflects Core limits
   - Stripe receipt email received (Dashboard → Customer emails)
6. Open **Manage billing** → Customer Portal: update payment method, view invoice
7. Cancel at period end from portal; confirm subscription status in app
8. Record pass in this file and close LB-006
9. Set `BILLING_ENFORCEMENT_ENABLED=true` in Vercel production; redeploy

## After pass

- Update `docs/readiness/launch-blocker-register.md` LB-006 → verified  
- Enable billing enforcement in production
