# Phase 16 handoff: Ask Fajita / Pamphlet support

**Date:** 2026-07-17  
**Supabase project:** `olvnjsqspvywvwfchtuc`  
**Migration:** `20260730000000_phase16_support_chatbot.sql` (applied)

## Outcome

Ask Fajita ships as Fajita’s support chatbot with Powered by Pamphlet attribution. Answers come from approved Fajita knowledge (docs, glossary, content, pricing, entitlements, claims) plus deterministic macros. Pamphlet conversation/knowledge/webhook APIs are intentionally disabled because no verified public contract exists.

## How to operate

1. Public: open site → Ask Fajita launcher, or `/support`
2. Authenticated: `/app/support` or app launcher when `pamphletSupport` is available
3. Ops: `/internal/support`, `/internal/support-lab`, `/internal/support/provider`
4. Env: see `.env.example` Pamphlet section (all optional)

## Transfer

- Pamphlet account ownership: unresolved until Pamphlet workspace is provisioned
- Credentials: rotate via env; never commit
- Knowledge rebuild: local registry is code-driven; Pamphlet sync deferred
- Disable chatbot: set `pamphletSupport` stage to `disabled` or remove mounts

## Intentionally deferred

- Live Pamphlet conversation create/stream/handoff
- Pamphlet knowledge sync
- Pamphlet webhooks
- Attachments
- Full conversation body storage
- Phone/SMS support
- Phase 17 platform admin OS
- Phase 18 final legal/security launch hardening
