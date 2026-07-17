# Phase 11 analytics events

Typed DataFast goals (`src/lib/analytics/goals.ts`) plus the internal funnel
source (`onboarding_events`). No customer content in any event.

## Onboarding goals

`firstSessionViewed`, `useCaseSelected`, `responsibilitySelected`,
`onboardingComplete`, `monitorActivated`, `firstRealCheckCompleted`,
`alertPathReady`, `statusPageReady`, `fullActivationCompleted`,
`checklistStepSkipped`, `checklistDismissed`, `checklistReopened`,
`tourStarted`, `tourCompleted`, `tourDismissed`, `tourReplayed`.

## Lifecycle and report goals

`weeklyReportViewed`, `weeklyReportExported`, `incidentRecapViewed`,
`incidentRecapExported`, `followUpActionCreated`,
`lifecycleEmailPrefsUpdated`, `lifecycleResendRequested`,
`cancellationFeedbackSubmitted`, `reactivationChecklistViewed`.

Metadata is bounded enums only (for example the selected use-case key, a
step key, or a tour key). Never sent: monitor URLs, secret headers,
organization names, customer emails, incident content, status-page
domains, subscriber data, free-text feedback.

## Funnel definitions (internal, from `onboarding_events`)

Stages: signup completed, organization created, use case selected, first
monitor draft, first monitor activated, first scheduled result, alert
channel verified, routing rule active, status page published, full
activation. Each event row carries organization, optional user, version,
event type, optional step key, and bounded metadata. Conversion and median
time between stages are computed from these server-side rows, segmented by
onboarding version, plan, and use case.

## Time-to-value

Differences between `organizations.created_at` and the milestone
timestamps on `organization_onboarding` (server timestamps only, never
browser analytics). Internal fixture organizations are excluded from
production metrics by the internal-organization exclusion list.

## Retention definitions

Documented in the handoff: weekly active organization (meaningful
authenticated action or active monitoring in the week), monitoring
retained (active monitor at period end), alert retained (healthy channel),
status-page retained (published page), activated retained (activated and
subscribed at 7, 30, 90 days). Page views alone never count as retention.

## Versioning

Goal names are append-only. Changing an event's meaning requires a new goal
name; funnel queries segment by `onboarding_events.version`.
