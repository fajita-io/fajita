---
name: lifecycle-communication-director
description: >-
  Communication architecture workflow for Fajita. Invoke before implementing
  transactional emails, security alerts, onboarding, notifications, billing
  emails, or notification centers. Produces a communication map, notification
  policy, and delivery-failure policy.
---

# Lifecycle communication director

## Purpose

Design the full communication architecture (transactional, security, billing, product, onboarding, lifecycle, marketing, operational, support) so every message has a legitimate trigger, a single dominant action, accurate product state, and correct consent behavior. Governed by `lifecycle-communications.mdc`.

## When to invoke

Before implementing welcome emails, authentication emails, security alerts, onboarding emails, activation nudges, processing notifications, product digests, usage alerts, billing emails, failed-payment emails, upgrade confirmations, cancellation emails, re-engagement, in-app notification centers, or support communications. This is Gate 4 in `DESIGN_WORKFLOW.md`.

## Required inputs

- The communication or notification under design.
- Current `communication-map.md`, `notification-policy.md`.
- `critical-user-journeys.md` (moments that warrant communication).
- Voice rules (`draper-honeycopy.mdc`, `voice-and-boundaries.mdc`) and company identity (`company.mdc`).
- Known state: no sending provider wired; Resend available as MCP but not a dependency; sender domain `[UNRESOLVED]`.

## Step-by-step workflow

1. Map the critical customer journeys.
2. Identify moments requiring communication.
3. Separate essential and optional communication.
4. Define trigger conditions.
5. Define suppression rules.
6. Define frequency limits.
7. Define channel.
8. Define urgency.
9. Define CTA.
10. Define failure and retry behavior.
11. Define preference behavior.
12. Define analytics.
13. Define template consistency.
14. Define testing requirements.

Require a communication map with: communication name, category, trigger, audience, channel, purpose, primary action, required data, suppression, retry behavior, preference behavior, and status. Product notifications and emails must not repeat the same information unnecessarily, and all communications must reflect real system state.

## Required outputs

- Communication architecture.
- Trigger map.
- Notification policy.
- Email inventory.
- Preference model.
- Delivery-failure policy.
- Testing plan.

## Quality gates

- Essential (security, account, billing) messages are never suppressed as marketing.
- Every message has one dominant action and a fallback destination.
- No secrets, passwords, or full credentials appear in any message.
- Idempotent send keys prevent duplicate sends from retried jobs.
- No message claims success before the underlying operation succeeds.
- Voice matches the approved Fajita voice with no em dashes.

## Failure conditions

- A message fires without a real trigger or invents activity.
- Recipient scoping is unclear (cross-recipient data leak risk).
- A marketing opt-out would silence a security alert.
- Preview text, plain-text fallback, or mobile layout is missing.

## Memory updates

- `communication-map.md`
- `notification-policy.md`
- `production-readiness-scorecard.md`

## Validation procedure

- Confirm each mapped communication ties to a real, observable system event.
- Confirm category-appropriate consent and suppression for every entry.
- Confirm the provider and sender domain are marked `[UNRESOLVED]` until wired, not fabricated.
- Cross-check analytics goals against `src/lib/analytics/goals.ts` (no PII, no reserved names).

## Explicit limits

This skill designs and documents communication behavior, maps, and policies. It does not implement email sending, templates, provider configuration, or notification UI, and it does not redesign product or marketing surfaces. It never fabricates activity, personalization, sender identity, or a provider that is not configured.
