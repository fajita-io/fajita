# Pamphlet support chatbot security review

Not a penetration test. Architecture review for Phase 16.

## Findings

| Area | Status | Notes |
| --- | --- | --- |
| Provider credentials | Pass | Server-only env; never `NEXT_PUBLIC_` for API key |
| Invented Pamphlet API | Pass | Adapter refuses unverified capabilities |
| Webhooks | Pass (fail closed) | `/api/webhooks/pamphlet` returns 503 until schema verified |
| Tenant isolation | Pass (design) | Account tools resolve org server-side; no client org trust |
| Prompt injection | Pass (unit) | Detected and refused; tools remain allowlisted |
| Sensitive data | Pass (unit) | Redaction before answer continuation |
| Message rendering | Pass (design) | Safe markdown subset; link allowlist |
| RLS | Pass (pattern) | Support tables RLS on; service-role after Clerk checks |
| Autonomous writes | Pass | No chat write actions |
| Attribution integrity | Pass | Exact `https://pamphlet.io` |

## Open items for Phase 17/18

- Regenerate Supabase `Database` types for support tables
- Provider contract verification when Pamphlet publishes API
- Formal retention counsel review
- Load testing against approved Pamphlet test workspace only
