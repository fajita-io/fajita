# Activation checklist

Phase 11. Persistent, server-derived setup progress on the overview
(`src/components/app/onboarding/activation-checklist.tsx`).

## Items

Core (all derived from real product state): create organization, create and
activate first monitor, receive first scheduled result, connect alert
channel, activate routing rule, publish status page, map first component.

Optional (skippable): use-case questions, invite teammate, review email
preferences, add SSL monitor, add heartbeat monitor.

## Behavior

- State is computed server-side by `getOnboardingState` from live product
  data, so it is correct across devices, across users, and after another
  member completes a step. Button clicks never complete steps.
- Every item links directly to the real action route.
- Items the viewer cannot perform are shown as not actionable with the
  reason (permission or plan), never hidden silently.
- Progress language is count-based ("2 core steps remaining"), never an
  arbitrary percentage, and never gamified.
- Optional steps can be skipped (`skipChecklistStepAction`); skips are
  recorded and reversible.
- The checklist can be dismissed after activation or on request
  (`dismissChecklistAction`) and reopened from Settings, Preferences
  ("Setup checklist" section, `reopenChecklistAction`).
- Dismissing the checklist hides guidance only; billing and security
  warnings are separate surfaces and are unaffected.

## Resume

Because state is derived, resume is free: the next incomplete eligible step
is always current, drafts persist in their own features, and no wizard
restarts.
