# Onboarding and lifecycle microcopy

Phase 11. Voice rules for every customer-facing string in onboarding,
checklists, guidance, and lifecycle email.

## Rules

- Clear, specific, calm, technically accurate.
- No em dashes anywhere customer-facing (enforced by unit tests on step
  copy and email output).
- No AI slop: banned words include seamless, powerful, robust, effortless,
  supercharge, unlock, revolutionize, "get started in seconds", "never miss
  an outage again", "set it and forget it", "your journey begins".
- No food jokes in incidents, billing, cancellation, or deletion.
- No guilt, no fake urgency, no gamification language.
- State facts with exact values and dates: "Fajita will check it every five
  minutes", "available until August 15, 2026".

## Reference copy in the product

- First session headline: "Let's watch something that matters."
- First activation: "Your first monitor is live." with "Fajita will check
  it every five minutes and keep the result history here."
- First check success: "First check complete. Fajita reached the endpoint
  and every required check passed."
- First check failure: "The first scheduled check failed. Fajita recorded
  the result and began the configured verification process."
- Alert onboarding: "Decide where Fajita should reach you." with "A monitor
  can find the problem. An alert channel makes sure your team hears about
  it."
- Status page onboarding: "Give customers one place to check."
- Progress: "2 core steps remaining", never arbitrary percentages.

## Pattern

Weak: "You are almost there."
Strong: "One core step remains: publish a status page."

Weak: "We noticed you have not finished setting up your account."
Strong: "Your website monitor draft is saved. Test it and activate it when
you are ready."
