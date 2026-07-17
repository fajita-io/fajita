# Cancellation feedback

Phase 11, integrated with the Phase 10 cancellation flow
(`src/components/app/billing/billing-actions.tsx`,
`src/lib/app/actions/billing.ts`).

## Collection

All optional, collected in the cancellation dialog: primary reason (too
expensive, missing feature, difficult to use, reliability concern, project
ended, just pausing, other), free-text feedback, missing feature (shown for
the missing-feature reason), and permission to follow up. Stored on
`billing_cancellation_records` (`reason_code`, `secondary_reason`,
`feedback`, `missing_feature`, `follow_up_ok`). Feedback submission is
audited and tracked as a count-only analytics goal; the text itself never
leaves the database.

## Response paths (no manipulation)

Reason-specific hints appear after selection and never block the cancel
button:

- Too expensive: review usage; downgrade if a lower plan genuinely fits;
  export data. No secret discounts.
- Missing feature: the feature is recorded; no delivery promises.
- Difficult to use: reopen the setup checklist; support link.
- Project ended or pausing: export data; retention and reactivation are
  explained with exact dates.

## Hard rules

Feedback is never required to cancel. No path obstructs cancellation, no
automatic discount appears, no call is required, and no countdown creates
fear. The confirmation shows the effective date, access until then, data
retention period, export action, and reactivation action with exact dates.
