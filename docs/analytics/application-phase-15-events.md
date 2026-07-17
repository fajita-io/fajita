# Phase 15 analytics events

Goals live in `src/lib/analytics/goals.ts`. Never send tool secrets, URLs, payloads, cron expressions, raw feedback, or correction bodies.

| Goal | When |
| --- | --- |
| `blog_index_viewed` | Blog index (wire when pageview goals are used client-side) |
| `article_viewed` | Article view |
| `content_search_*` | Search open / submit / empty / select |
| `comparison_viewed` | Comparison page |
| `comparison_correction_started` | Correction form accepted |
| `tool_started` / `tool_completed` / `tool_validation_failed` / `tool_result_copied` | Tool interaction |
| `content_product_cta` | Contextual CTA click |
| `content_feedback` | Feedback submitted |
| `content_rss_requested` / `content_raw_requested` / `content_manifest_requested` | Machine-readable fetches (optional server goals) |

Affiliate commission attribution remains Phase 12. Organic assistance definitions: `src/lib/content/attribution.ts`.
