# Critical user journeys

Structured journey templates for Fajita. Populate via `product-experience-director`. Do not invent unsupported product facts.

**Production verification (2026-07-27):** Public smoke (57 routes), authenticated-adjacent smoke (cron, billing webhooks, status page), live billing fixtures (API + Checkout UI), and alert fixtures passed on `https://fajita.io`. Browser login E2E remains optional before Stage 2.

**Product (master directive 0.0):** Uptime monitoring for websites, APIs, certificates, and cron jobs, with alerting and public status pages. Core surfaces: Monitors, Incidents, Status Pages, Alert Channels, Maintenance, Team, Billing, Settings.

---

## Journey: Discover product (marketing)

User: Software team member responsible for uptime (developer, SRE, ops-minded founder); persona detail `[UNRESOLVED]`
Intent: Understand what Fajita does and whether it fits their need
Entry point: Organic search, referral, direct (fajita.io)
Prerequisites: None
Steps: Land on homepage → scan value prop → optional interactive demo → evaluate proof → CTA
Decision points: Try demo vs. signup vs. leave
Primary action: Start signup or try demo (TBD per conversion map)
System feedback: Immediate demo response; clear CTA states
Potential confusion: Product category unclear if copy generic
Failure conditions: Slow load, broken demo, vague promise
Recovery: Static demo fallback; clear value copy
Success condition: User clicks primary CTA or completes demo
Next best action: Signup or waitlist
Trust requirements: Honest product description; company identity (`company.mdc`)
Analytics: `demo_request` engagement TBD; landing page views via DataFast
Status: **Not implemented** (placeholder homepage only)

---

## Journey: Sign up

User: Prospective customer
Intent: Create account
Entry point: Homepage CTA, pricing, demo handoff
Prerequisites: `[UNRESOLVED]` auth provider (Supabase configured in repo)
Steps: `[UNRESOLVED]`
Decision points: `[UNRESOLVED]`
Primary action: Complete registration
System feedback: Validation inline; loading on submit
Potential confusion: `[UNRESOLVED]`
Failure conditions: Email taken, network error, validation fail
Recovery: Preserve form input; retry; support link
Success condition: Account created, session established
Next best action: Onboarding
Trust requirements: Privacy link; no dark patterns
Analytics: `signup` (`DataFastGoals`)
Status: **Not implemented**

---

## Journey: Onboard to first value

User: New account
Intent: Reach activation (first meaningful outcome)
Entry point: Post-signup redirect
Prerequisites: Authenticated session
Steps: Shortest honest path to first monitor created and first check running; exact flow `[UNRESOLVED]`
Decision points: Skip optional steps (alert channels, team invites can come later)
Primary action: Create first monitor
System feedback: Progress; first check result visible fast
Potential confusion: Too many questions before value
Failure conditions: Abandon mid-flow
Recovery: Resume onboarding; email reminder TBD
Success condition: `onboarding_complete` + `first_monitor`
Next best action: Add an alert channel or a second monitor
Trust requirements: Explain why each asked field matters
Analytics: `onboarding_complete`, `first_monitor`
Status: **Not implemented**

---

## Journey: Create a monitor (core product)

User: Active user
Intent: Watch a website, API, certificate, or cron job
Entry point: Dashboard, Monitors list, onboarding handoff
Prerequisites: Authenticated; workspace exists (`[UNRESOLVED]` data model)
Steps: `[UNRESOLVED]` choose monitor type → target URL/schedule → check interval → alert channel → save
Decision points: Monitor type, interval, alerting
Primary action: Save monitor
System feedback: Saving → saved; first check runs and result shows quickly
Potential confusion: What each monitor type checks; interval tradeoffs
Failure conditions: Invalid target, unreachable target, save fails
Recovery: Preserve input; retry; explain unreachable vs. invalid
Success condition: Monitor active with first check result
Next best action: Add alert channel, create status page
Analytics: `monitor_created` (`first_monitor` when it is the account's first)
Status: **Not implemented**

---

## Journey: Incident detected and communicated (core product)

User: Team member on call
Intent: Learn about a problem before customers report it; communicate status
Entry point: Alert (email, other channels TBD) → incident view
Prerequisites: Active monitor; alert channel configured
Steps: `[UNRESOLVED]` detection → verification → alert → acknowledge → publish incident to status page → resolve
Primary action: Acknowledge and manage incident
System feedback: Clear incident state (detected, verified, acknowledged, resolved); status page reflects updates
Potential confusion: Verified outage vs. transient blip
Failure conditions: Alert not delivered; status page stale
Recovery: Escalation rules TBD; manual incident creation
Success condition: Incident resolved and communicated; recovery visible
Analytics: Incident lifecycle goal names TBD via `product-analytics-architect`
Status: **Not implemented**

---

## Journey: Upgrade / checkout

User: Free or trial user hitting limit
Intent: Pay for more capability
Entry point: Plan gate, settings, pricing
Prerequisites: `[UNRESOLVED]` billing (Stripe analytics module exists in repo)
Steps: `[UNRESOLVED]`
Primary action: Complete checkout
System feedback: Clear pricing; processing state
Failure conditions: Payment declined
Recovery: Retry; preserve cart
Success condition: `initiate_checkout` → subscription active
Trust requirements: Price, renewal, cancel terms visible
Analytics: `initiate_checkout` (avoid reserved Stripe goal names in DataFast)
Status: **Not implemented**

---

## Journey: Return visit

User: Returning customer
Intent: Continue work
Entry point: Login, deep link, bookmark
Prerequisites: Account
Steps: Auth → workspace with recent items TBD
Primary action: Resume primary task
System feedback: Oriented shell; recent work visible
Success condition: User reaches workspace < 10s after auth
Analytics: `sign_in`
Status: **Not implemented**

---

*Add journeys via `product-experience-director`. Update Status as implemented.*
