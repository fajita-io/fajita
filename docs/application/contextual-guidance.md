# Contextual guidance

Phase 11. Guidance attaches to real empty or incomplete states in the
feature where the gap exists. There is no universal tooltip layer.

## Inventory

| Surface | Condition | Guidance |
| --- | --- | --- |
| Monitor detail | No alert channel | "This monitor can detect a problem, but Fajita does not yet know where to alert your team." Action: Connect Alert Channel |
| Incidents | No status page | "Incident data is private until you publish a status page." Action: Create Status Page |
| Status page editor | Component without a mapped monitor | "This status page is live, but no monitor currently controls this component." Action: Map Monitor |
| Status page settings | Subscriptions disabled | "Customers can view this page, but they cannot subscribe to email updates yet." Action: Enable Subscriptions |
| Overview | Pre-activation | Activation checklist with the next recommended step |

## Rules

- One concept, one action per prompt.
- Prompts respect permissions: a viewer who cannot perform the action sees
  the state explanation without a dead button.
- Prompts disappear when the underlying state is resolved because they are
  derived from the same server state as the checklist.
- No stacked banners, no promotional content, no guilt.

## Education cards

Bounded cards explain verification, recovery, retries, uptime math,
maintenance visibility, subscriber consent, and plan limits in the surfaces
where those concepts appear. Each card is one concept, one example, one
action. Cards never appear all at once.
