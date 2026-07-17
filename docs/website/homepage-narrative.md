# Homepage narrative (Phase 2)

The homepage is a directed story in fourteen movements. Each section has
one job; none repeat.

| # | Section | Job | Component |
| --- | --- | --- | --- |
| 1 | Hero | Category in one glance: locked headline, locked support copy, CTA pair, proof line, interactive Thermal Stack story | `HeroNarrative` (client) |
| 2 | Product proof | "One quiet screen": realistic monitor preview with deterministic sample data | `MonitorPreview` (server) |
| 3 | Problem | "Your customers should not be your monitoring system": two contrasting timelines (customer-reported vs Fajita-detected) | server JSX |
| 4 | Coverage | Five monitor types around one console; tabbed explorer | `CoverageExplorer` (client, ARIA tabs) |
| 5 | Detection | "One bad request is noise. A confirmed outage is a signal." Four verification steps | server JSX |
| 6 | Alert flow | Verified incident routes to email/Slack/Discord/webhook | `AlertFlow` (SVG, CSS animation) |
| 7 | Status pages | "When something breaks, silence makes it worse." Five simulated scenarios | `StatusPagePreview` (client) |
| 8 | Lightweight | "Monitoring without the monitoring department." Six "No X" items | server JSX |
| 9 | Product journey | Nine-step hands-on demo, `id="how-it-works"` | `ProductJourney` (client) |
| 10 | Pricing preview | Three plans, no invented numbers, link to `/pricing` | `PlanCards` (server) |
| 11 | Security | Principles + link to `/security` | server JSX |
| 12 | FAQ | Twelve real purchase objections + FAQPage JSON-LD | `FaqList` (client, details/summary) |
| 13 | Final CTA | Repeat of the one primary action | `CtaButtons` |
| 14 | Footer moment | "Keep the stack sizzling. Stop it from burning." + playable incident loop | `FooterMoment` (client) |

## Why this order

Clarity before persuasion: the visitor knows what Fajita is (1-2) before
being shown why it matters (3), what it covers (4-7), why it is easier
(8), and proof they can touch (9). Commercial context (10-11) lands only
after value is established. The FAQ (12) removes the last objections
next to the final CTA (13-14).

## Hero Thermal Stack story

Eight captioned beats: operational, response time rising, verification,
confirmation, alert to channel, status page updated, recovery,
operational again. User-controlled (Play / step dots), reduced-motion
users get static states with the same captions, and the entire story is
readable as text without the animation.
