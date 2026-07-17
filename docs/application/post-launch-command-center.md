# Post-launch command center

**Route root:** `/internal/post-launch`  
**Status:** Blocked-state UI live; growth workflows deferred

## Audience

Platform operators only. Noindex. Not linked from public AI files.

## Subroutes

| Path | Intent |
| --- | --- |
| `/internal/post-launch/overview` | Prerequisite check, guards, deferred metrics notice |
| `/internal/post-launch/cohorts` | Launch cohorts (deferred) |
| `/internal/post-launch/regressions` | Regression detection (deferred) |
| `/internal/post-launch/feedback` | Feedback registry (deferred) |
| `/internal/post-launch/bugs` | Bug registry (deferred) |
| `/internal/post-launch/requests` | Feature requests (deferred) |
| `/internal/post-launch/interviews` | Research ops (deferred) |
| `/internal/post-launch/experiments` | Experiment registry (deferred) |
| `/internal/post-launch/onboarding` | Activation funnel (deferred) |
| `/internal/post-launch/retention` | Retention analysis (deferred) |
| `/internal/post-launch/churn` | Churn analysis (deferred) |
| `/internal/post-launch/advocacy` | Advocacy consent (deferred) |
| `/internal/post-launch/growth` | Growth quality (deferred) |
| `/internal/post-launch/reviews` | Weekly / monthly reviews (deferred) |

## Integration

- Nav: Command → Post-launch
- Command center shows Phase 19 authorization summary
- Does not replace `/internal/revenue`, `/internal/customers`, `/internal/support`, `/internal/content`, `/internal/affiliates`, `/internal/security`, `/internal/audit`, `/internal/feature-flags`, or `/internal/approvals`

## Operator behavior while Blocked

1. Read overview prerequisite table.
2. Follow linked Phase 18 blockers on `/internal/readiness`.
3. Do not treat deferred sections as empty product metrics.
4. Keep public signup and paid checkout flags off until go-live approves.

## Microcopy

- Authorization language is factual: Blocked, Conditionally Authorized, Authorized.
- Do not claim retention is solved or experiments are optimized.
- Incomplete metrics must be labeled incomplete, never zero-filled.
