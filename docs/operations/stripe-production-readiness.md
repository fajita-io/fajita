# Stripe production readiness

**Account:** Fajita (`acct_1TtsfnGsXdkMfv91`)  
**Last audit:** 2026-07-20

Run the automated audit anytime:

```bash
npm run stripe:production-ready
npm run stripe:production-ready -- --fix   # create portal config, set tax codes
```

## What is done (Fajita side)

| Item | Status |
| --- | --- |
| Live API keys (`sk_live_` / `pk_live_`) | Set in `.env.production.local` and Vercel |
| Products (Core, Team, Scale) | Seeded with plan metadata |
| Prices (6 lookup keys) | Match catalog ($12/$120, $49/$490, $99/$990) |
| Webhook | `https://fajita.io/api/webhooks/stripe` (11 events) |
| Branding | Logo, icon, `#17130e` / `#e8590c` |
| Customer Portal | Default config (cancel at period end, invoices, payment method) |
| Product tax codes | `txcd_10701400` (SaaS / business use) |

## Waiting on Stripe (not fixable in code)

The live account shows **Review in progress**. Until Stripe finishes:

- `charges_enabled` = false  
- `payouts_enabled` = false  
- `card_payments` capability = pending  

**Action:** Dashboard → **View account status**. Respond to any email from Stripe. Typical turnaround: 2–3 business days.

Re-check:

```bash
npm run stripe:production-ready
```

Exit code `2` means only Stripe review is blocking. Exit code `1` means fixable gaps remain.

## After review clears

1. **Controlled live payment test** (LB-006). See [real-payment-test.md](./real-payment-test.md).
2. Set `BILLING_ENFORCEMENT_ENABLED=true` in Vercel production and redeploy.
3. Confirm webhook events land in `billing_webhook_events` for the test subscription.

## Ignore unless you want MoR

**Managed Payments → Needs info** on products is optional. Fajita Checkout does not enable Managed Payments. Standard merchant billing applies.

## Related scripts

| Command | Purpose |
| --- | --- |
| `npm run stripe:seed` | Create or rotate products/prices |
| `npm run stripe:verify-prices` | Assert catalog amounts match Stripe |
| `npm run wire:production` | Webhook + Vercel production env sync |
