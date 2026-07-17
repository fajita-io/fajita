# Application Phase 16 analytics events

Goals live in `src/lib/analytics/goals.ts`. Never send message bodies, emails, org names, monitor URLs, incident titles, secrets, or provider conversation ids.

| Goal | When |
| --- | --- |
| `support_launcher_viewed` | Launcher mount |
| `support_launcher_opened` | Panel opens |
| `support_launcher_closed` | Panel closes |
| `support_prompt_selected` | Suggested prompt click |
| `support_message_submitted` | User send |
| `support_answer_displayed` | Answer rendered |
| `support_source_selected` | Citation click |
| `support_handoff_offered` | Answer offers handoff |
| `support_handoff_requested` | User starts handoff |
| `support_feedback_submitted` | Thumbs feedback |
| `support_provider_unavailable` | Ask API failure |
| `support_pamphlet_clicked` | Attribution click |
| `support_sensitive_warning` | Credential warning |
| `support_injection_detected` | Injection path |

Metadata may include coarse enums: `mode`, `area`, `confidence`, `type`.
