# Interaction decisions

Log for Fajita product interactions. Format below. System installation entries first.

---

## Interaction Decision: Design and experience systems split

Status: Approved (system installation)
Area: Process
User intent: N/A (meta)
Behavior: Creative decisions in `design-memory/`; experience decisions here
Feedback: N/A
Failure behavior: N/A
Accessibility: N/A
Mobile behavior: N/A
Reduced-motion behavior: N/A
Reason: Separate visual art direction from product behavior memory
Alternatives considered: Single memory folder (rejected for clarity)
Tradeoffs: Agents read both systems
Implementation implications: `design-workflow-auto.mdc` loads both when relevant

---

## Interaction Decision: DataFast analytics goals

Status: Approved (existing code)
Area: Analytics
User intent: Measure funnel and product milestones
Behavior: Track via `DataFastGoals` constants; sanitize params
Feedback: N/A (background)
Failure behavior: Analytics failure must not block user actions
Accessibility: N/A
Mobile behavior: Same events
Reduced-motion behavior: N/A
Reason: Privacy-conscious product analytics (`product-analytics-architect`)
Alternatives considered: Ad-hoc string event names (rejected)
Tradeoffs: Must avoid reserved Stripe goal names
Implementation implications: `src/lib/analytics/goals.ts`, client/server track helpers

---

## Interaction Decision: AI crawler tracking

Status: Approved (existing middleware)
Area: Infrastructure / visibility
User intent: N/A
Behavior: `trackAICrawlerRequest` in middleware on matched routes
Feedback: N/A
Failure behavior: Non-blocking background track
Accessibility: N/A
Mobile behavior: N/A
Reduced-motion behavior: N/A
Reason: SEO and AI visibility (`seo-ai-visibility.mdc`)
Implementation implications: Preserve middleware matcher for robots, sitemap, llms.txt

---

*Add interaction decisions via `microinteraction-director`, `interface-state-director`, `onboarding-activation-architect`.*
