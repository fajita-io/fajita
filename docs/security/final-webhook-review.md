# Final webhook review

**Date:** 2026-07-17  
**Owner:** security / engineering  
**Classification context:** Not Ready

Stripe: signature verify then `processStripeWebhookEvent` with inbox idempotency (`billing_webhook_events`). Clerk/Resend/subscriber webhooks follow signature + token patterns per prior phases.

Tests: `src/lib/billing/webhook-inbox.test.ts`. Residual: LB-009 route-level signature e2e.

