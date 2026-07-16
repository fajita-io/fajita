# Notification policy

How Fajita decides notification severity, channel, and delivery. Governed by `lifecycle-communications.mdc`. Update via `lifecycle-communication-director`. Pairs with `communication-map.md` (the registry of specific messages).

Nothing here is implemented yet; this is the intended policy. Mark `[UNRESOLVED]` where undecided.

---

## Severity

| Severity | Meaning | Default channel | Can user mute? |
| --- | --- | --- | --- |
| Critical | Security or account integrity, verified incident | Email + in-app (+ alert channel for incidents) | No |
| Important | Billing action needed, activation-blocking | Email + in-app | Limited (essential billing not mutable) |
| Informational | Digests, tips, non-urgent product updates | In-app, optional email | Yes |
| Marketing | Announcements, re-engagement | Email (opt-in) | Yes |

## In-app versus email

- Prefer in-app for informational events a user will see next session.
- Use email when the user must act away from the app or is not currently active.
- Do not send the same content in both channels unless the event is critical and time-sensitive.

## Essential versus optional

- Essential: security alerts, auth flows, verified incident alerts, receipts, failed-payment, cancellation/upgrade confirmations. Never suppressed by marketing preferences.
- Optional: digests, activation nudges, tips, re-engagement, announcements. Honor opt-out.

## Frequency limits

- Debounce repeated events (for example flapping monitors) into a single notification or an escalation, per incident policy `[UNRESOLVED]`.
- Cap optional lifecycle messages (for example one activation nudge, strict re-engagement cap).
- Bundle low-severity events into digests rather than sending many individual messages.

## Read / unread, dismissal, expiration

- In-app notifications track read/unread state.
- Users can dismiss informational notifications; critical ones persist until acknowledged.
- Time-bound notifications expire (for example trial-ending after the trial resolves). Exact windows `[UNRESOLVED]`.

## Deep linking

Every notification links to the specific relevant item (incident, invoice, monitor), not a generic dashboard.

## Mobile behavior

Notifications and their emails render correctly on mobile (mobile-safe layouts, tappable actions). Push notifications: `[UNRESOLVED]` (not planned yet).

## Accessibility

In-app notifications use accessible live regions and focus behavior (`accessibility-aa`, `frontend-quality.mdc`). Color is never the only signal of severity.

## Preference behavior

- A preference center governs optional categories.
- Essential categories are shown as always-on and explained, not toggleable.
- Preferences are honored server-side before send.

## Security-message exceptions

Security and account-integrity messages (new-device sign-in, password reset, email change, suspicious activity) always send regardless of marketing preferences.

## Billing-message exceptions

Essential billing messages (receipts, failed-payment, cancellation, upgrade/downgrade confirmations) always send. Only non-essential billing lifecycle (for example promotional upgrade nudges) is optional.

## Status

Installation baseline recorded 2026-07-16. Frequency windows, incident debounce/escalation, expiration windows, and push support are `[UNRESOLVED]`. Resolve via `lifecycle-communication-director` at Gate 4.
