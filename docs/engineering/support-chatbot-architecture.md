# Support chatbot architecture

Ask Fajita is Fajita’s product support experience. Pamphlet is the approved provider for conversation platform capabilities when verified.

## Layers

1. **UI**: launcher, desktop panel, mobile sheet, `/support`, `/app/support`
2. **API**: `POST /api/support/ask`
3. **Decision engine**: sensitive scan → injection scan → macros → retrieval → validation
4. **Knowledge registry**: docs, glossary, blog, comparisons, tools, pricing, entitlements, claims
5. **Account tools**: authenticated read-only, permissioned, audited
6. **Pamphlet adapter**: truthful disabled until contract verified
7. **Local metadata**: conversation/handoff/feedback/safety tables (no default message bodies)

## Modes

- Public: approved public sources only
- Authenticated: public sources + server-resolved org context via allowlisted tools

## Non-goals (Phase 16)

No autonomous writes, no second help desk, no fake Pamphlet API, no phone/SMS support, no unsafe attachments.
