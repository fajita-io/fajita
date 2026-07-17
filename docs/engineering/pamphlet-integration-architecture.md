# Pamphlet integration architecture

Internal. Phase 16.

## Inspection result (2026-07-17)

| Surface | Result |
| --- | --- |
| https://pamphlet.io | Public CRM marketing site |
| Public API / OpenAPI | Not found |
| npm SDK | No Pamphlet support-chatbot package |
| Widget contract | Not found |
| Webhook schema | Not found |
| Repository layer | None prior to Phase 16 |

## Policy

Pamphlet remains the approved conversation provider. Fajita must not invent endpoints or pretend provider calls succeed.

## Adapter

`src/lib/pamphlet/`

- `capabilities.ts`: verified vs unavailable registry
- `config.ts`: optional env
- `client.ts`: methods return `not_configured` or `capability_unavailable`
- `health.ts`: honest status for ops

Verified today: attribution link `https://pamphlet.io` only.

## Local answer path

Ask Fajita answers from Fajita approved knowledge (`src/lib/support/`) while Pamphlet sync/handoff stay disabled. UI always shows Powered by Pamphlet.

## Enabling a real provider later

1. Obtain a written API contract from Pamphlet.
2. Mark capabilities `verified` with date.
3. Implement matching methods in `client.ts`.
4. Add signature verification for webhooks.
5. Separate test and production workspaces.
6. Re-run Phase 16 provider tests.
