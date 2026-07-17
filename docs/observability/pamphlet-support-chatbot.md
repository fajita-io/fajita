# Pamphlet support chatbot observability

Track:

- Ask API success/error rates (application logs, coarse categories)
- Pamphlet health status from `getPamphletHealth()`
- Safety events (`support_safety_events`)
- Redaction counts
- Handoff requests
- Knowledge source count (registry size)

Do not log full messages, answers, secrets, or provider credentials.

Internal view: `/internal/support/provider`
