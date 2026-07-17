# First session

Phase 11. The focused experience after signup and organization creation, at
`/app/onboarding` (`src/components/app/onboarding/first-session.tsx`).

## What it answers

1. What should I monitor? Optional use-case and first-concern questions feed
   `recommendMonitor`, which suggests a website, API, SSL, or heartbeat
   monitor with a stated reason.
2. How long will this take? The copy states the expected setup time plainly.
3. What happens after activation? The recommendation explains the first
   check and where results appear.

## Questions

- "What are you responsible for?" (SaaS product, API, client websites,
  internal jobs, ecommerce, personal project, something else)
- "What do you want to catch first?" (website outage, API failure, slow
  response, expiring SSL certificate, missed cron job)
- Responsibility role (founder/owner, developer, operations, support,
  agency, other), used only to tune guidance relevance.

All questions are skippable. No revenue, funding, phone, job title, or
company size is collected. Answers persist on `organization_onboarding`
(`use_case`, `first_concern`, `responsibility_role`) and can be changed
later.

## Actions

Primary: Create First Monitor (deep link to the recommended monitor type).
Secondary: Finish Later (goes to the overview; the checklist keeps the
thread). The main application is never blocked; the app shell and all
navigation work throughout.

## State

Selections save through `saveOnboardingContextAction`, which records
`use_case_selected` and `role_selected` funnel events and analytics goals
(no free text, no URLs). Returning to `/app/onboarding` restores prior
answers.
