# provider outage exercises

**Date:** 2026-07-17  
**Owner:** operations / engineering

| Provider | Customer effect | Degraded mode | Manual process |
| --- | --- | --- | --- |
| Clerk | Auth down | Status page still public | Wait / status comms |
| Supabase | App + monitors impacted | Pause noncritical jobs | Restore / provider status |
| Stripe | Checkout/billing webhooks delayed | Entitlements freeze safe | Reconciliation |
| Resend | Email alerts delayed | Slack/Discord/webhook remain | Retry / dead letter |
| Pamphlet | Chat unavailable | Human email handoff | Fallback copy |
| Vercel | App deploy path | Status CDN path prioritized | Rollback |

Detailed runbooks in disaster-recovery plan.

