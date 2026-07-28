# real payment test

**Date:** 2026-07-17  
**Owner:** operations  
**Prerequisite:** `npm run stripe:production-ready` shows `charges_enabled` OK (Stripe account review complete).

## Status: PASSED (2026-07-27)

Controlled live billing fixtures completed:

| Fixture | Result |
| --- | --- |
| API subscription (`npm run launch:payment-fixture`) | PASSED |
| Checkout UI + portal (`npm run launch:checkout-ui`) | PASSED 2026-07-27 |
| Live subscription (Checkout UI) | `sub_1TxwcaGsXdkMfv91Q9maYlYW` (canceled after test) |
| Customer Portal session | Created and loaded in Playwright |
| Webhooks processed | `checkout.session.completed`, subscription events synced |
| Fixture tag | `checkout_ui_fixture_2026_07_27` |
| Revenue exclusion | promotion code `fajita_launch_fixture_100` |

Prior API-only fixture (`launch_fixture_2026_07_27`) also passed.

`BILLING_ENFORCEMENT_ENABLED=true` in Vercel production on 2026-07-27.

### Checkout UI fixture command

```bash
FIXTURE_ORG_ID=95d5b566-2b62-4ff8-b6c2-0de8f714f0ce \
FIXTURE_USER_ID=<profile_uuid> \
npm run launch:checkout-ui
```

Uses internal org `fajita-platform` with 100% launch promotion code ($0 total).

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
