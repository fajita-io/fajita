# Phase 16 data map

| Data | Stored where | Retention class |
| --- | --- | --- |
| Conversation metadata | `support_conversations` | public_anonymous / authenticated_support / billing / security |
| Message metadata | `support_messages_metadata` | same as conversation |
| Full message bodies | Not by default | n/a |
| Redaction events | `support_redactions` | abuse/safety bounded |
| Safety events | `support_safety_events` | restricted |
| Handoffs | `support_handoffs` | support continuity |
| Feedback | `support_feedback` | quality review |
| Lead email | hash only in `support_leads` | sales consent |
| Pamphlet provider payloads | Deferred | n/a until contract |

Do not claim Pamphlet residency or no-training behavior without verification.
