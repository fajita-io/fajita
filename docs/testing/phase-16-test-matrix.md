# Phase 16 test matrix

## Automated (shipped)

| Suite | Location | Coverage |
| --- | --- | --- |
| Adapter/safety/answers | `src/lib/support/phase16.test.ts` | Pamphlet refusal, redaction, injection, SMS honesty, fixtures, attribution URL |

## Manual / staging

- Public launcher open/close
- Authenticated `/app/support`
- Provider unavailable fallback links
- Mobile sheet
- Powered by Pamphlet link target
- Cross-tenant denial for account tools

## Deferred until Pamphlet contract

- Provider create/stream/handoff/webhook integration tests
- Knowledge sync to Pamphlet
- Load tests against Pamphlet production
