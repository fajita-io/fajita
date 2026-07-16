# Experience principles

Living document for Fajita product behavior. Update via `product-experience-director` and related skills.

---

## Product experience promise

Your team hears about problems before your customers do. Fajita monitors websites, APIs, certificates, and cron jobs; the product should feel **watchful, fast, and calm during emergencies** (master directive 0.0).

**Superseded hypothesis:** Earlier notes assumed a citation/provenance product. Fajita is uptime monitoring.

## Desired user emotions

| Moment | Emotion |
| --- | --- |
| First landing | Curious, not skeptical |
| First action | Confident the system heard them |
| Waiting | Informed, not anxious |
| Success | Accomplished, ready for next step |
| Error | Supported, not blamed |
| Return visit | Oriented immediately |

`[UNRESOLVED]` Refine after creative thesis approved.

## Clarity principles

- One primary action per screen
- Plain language over jargon (`voice-and-boundaries.mdc`)
- Show evidence for status claims (check results, timestamps, verification) so status is trusted, not asserted
- Never hide what the system is doing during async work

## Feedback principles

- Acknowledge every intentional action immediately
- Distinguish saved, saving, and failed
- Progress for operations > 300ms perceived
- Completion states suggest next step

## Progress principles

- Long tasks show state (queued, running, percent when known)
- Onboarding shows step X of Y
- Users can exit and resume without loss

## Error-recovery principles

- Preserve user input
- Explain what happened and what is safe to retry
- Offer help path; no stack traces customer-facing
- Destructive actions: confirm and undo when feasible

## Progressive-disclosure principles

- Day one: core value path only
- Power features revealed after activation
- Skippable guidance; keyboard shortcuts documented for repeat users

## Trust principles

- Honest claims only (`trust-and-claims.mdc`)
- Company identity visible (`company.mdc`: Fajita, Kalispell address)
- Demo labeled when not live production data
- Billing and data handling explicit

## Speed principles

- Feel instant; explain when not (`perceived-performance.mdc`)
- Skeleton geometry matches content
- No decorative weight before primary content

## Delight principles

- Subtle completion acknowledgment
- Restraint: no confetti without achievement
- Brand motion on signature moments only

## Restraint principles

- No interaction theater
- No fake social proof
- No blocking tours

## Accessibility principles

- Keyboard complete for core journeys
- Focus visible; reduced motion honored
- Color not sole signal (`frontend-quality.mdc`)

---

*Last updated: experience system installation.*
