# Analytics plan

Privacy-conscious analytics for Fajita via DataFast. Update via `product-analytics-architect`.

**Provider:** DataFast (`src/lib/analytics/`, `datafastConfig`)
**Domain:** fajita.io
**Bot/AI crawl tracking:** `@datafast/ai-crawl` in `src/middleware.ts` (separate from product events)

---

## Business questions

| Question | Primary events | Status |
| --- | --- | --- |
| Do visitors understand and try the product? | Page views, demo engagement TBD | Partial |
| Who signs up? | `signup` | Defined, not wired everywhere |
| Who activates? | `onboarding_complete`, `first_monitor` | Defined |
| Who pays? | `initiate_checkout` | Defined |
| Who returns? | `sign_in` | Defined |
| Where do users fail? | Error events TBD | Not defined |

---

## Funnel stages

1. Landing (organic/referral/direct)
2. Demo interaction (`demo_started`, `demo_completed`)
3. CTA click (`hero_cta`, `nav_cta`)
4. `signup`
5. Onboarding steps → `onboarding_complete`
6. Activation → `monitor_activated`, `first_real_check_completed`
7. Engagement → `monitor_created`, `alert_channel_added`, `status_page_published`, `invite_sent`
8. Upgrade intent → `initiate_checkout` → `payment`

### DataFast funnels (live)

Created via `npx tsx scripts/datafast-setup-journey.ts` against website `6a590dc8d762e1ae10179867`.

| Funnel | Steps | Primary question |
| --- | --- | --- |
| Marketing to signup | Landing → demo → hero CTA → signup page → signup → org → onboarding → monitor live | Do visitors convert from marketing to first monitor? |
| Product activation | Signup → org → onboarding → monitor → activated → first check → alerts → full activation | Where do new accounts stall after signup? |
| Pricing to payment | Pricing → plan selected → checkout → payment | Does pricing traffic convert to revenue? |
| Homepage demo engagement | Landing → demo start → demo complete → hero/nav CTA | Does the interactive demo drive intent? |
| Contact inquiry | Contact page → form start → submit | Do contact visitors complete the form? |
| Status page launch | Creation → created → publish attempt → success → published | How do teams ship a status page? |
| Alert channel setup | Setup start → created → test pass → activated | Do teams wire alerts successfully? |
| Team expansion | Invite initiated → sent → accepted | Does the product spread inside teams? |

34 funnel goals have dashboard display names (colors + descriptions). Remaining `DataFastGoals` constants appear automatically when events fire.

---

## Definitions

| Term | Definition | Status |
| --- | --- | --- |
| Activation | `[UNRESOLVED]` Recommend: `first_monitor` (first monitor created and checking) within 7 days of signup | Proposed |
| First value | First monitor runs its first check and the user sees the result | Hypothesis |
| Engagement | Second session with `monitor_created` or `alert_channel_added` | TBD |
| Conversion | Completed checkout | TBD |

---

## Event dictionary

| Event | Trigger | Intent | Properties (sanitized) | Exclusions | Question answered | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `signup` | Account created | Register | plan TBD | email, password | Conversion | Code constant |
| `sign_in` | Login success | Return | method TBD | credentials | Retention | Code constant |
| `newsletter_subscribe` | Newsletter submit | Stay informed | — | email | Top of funnel | Code constant |
| `initiate_checkout` | Checkout started | Purchase | plan_id | payment details | Revenue intent | Code constant |
| `waitlist_join` | Waitlist submit | Early access | — | email | Demand | Code constant |
| `demo_request` | Demo CTA | Evaluate product | — | — | Interest | Code constant |
| `first_monitor` | First monitor created | Activate | monitor_type | target URLs with secrets | Activation | Code constant |
| `monitor_created` | Monitor created | Core use | monitor_type | target URLs with secrets | Engagement | Code constant |
| `alert_channel_added` | Alert channel connected | Get alerted | channel_type | webhook URLs, tokens | Engagement | Code constant |
| `status_page_published` | Status page published | Communicate | — | — | Engagement | Code constant |
| `invite_sent` | Invite action | Expand team | — | invitee email | Viral | Code constant |
| `onboarding_complete` | Onboarding finished | Setup done | steps_completed | — | Onboarding | Code constant |

**Reserved:** Do not use DataFast payment-provider reserved names (see `goals.ts`).

---

## Privacy exclusions (never send)

- Passwords, tokens, API keys
- Full email addresses in custom properties (use hashed ID or omit)
- Monitor target URLs containing secrets, tokens, or internal hostnames
- Alert channel webhook URLs or tokens
- Credit card or billing identifiers
- Secrets from `.env`

Use `sanitizeGoalParams()`; max 10 properties; 255 char values.

---

## Implementation status

| Area | Status |
| --- | --- |
| DataFast script in layout | Implemented (`DataFastScript`) |
| Goal constants | Implemented (`goals.ts`) |
| Client track helpers | Implemented (`lib/analytics/client.ts`) |
| Server track | Implemented (`lib/analytics/server.ts`) |
| Stripe integration module | Present (`lib/analytics/stripe.ts`) |
| Event wiring on UI flows | **Not implemented** (no auth/onboarding UI yet) |

---

## Validation status

| Check | Status |
| --- | --- |
| Events fire once per action | Not validated |
| No PII in payload | Not validated |
| Analytics failure non-blocking | Required by skill |
| Funnel visible in DataFast | Pass (8 funnels + 34 goal labels) |

---

*Extend dictionary before wiring new UI. Validate in dev network tab.*
