---
name: operations-and-observability-architect
description: >-
  Operations and observability workflow for Fajita. Invoke before implementing
  background jobs, scheduled tasks, webhooks, email delivery, AI generation,
  imports, exports, or integrations. Produces a job register, logging policy,
  alert plan, recovery plan, and incident playbook entries.
---

# Operations and observability architect

## Purpose

Make critical system behavior diagnosable and recoverable before it ships: structured logging without sensitive content, retries and idempotency, failed-job handling, alerts with ownership, customer-facing status, and support diagnostics. Governed by `operations-and-observability.mdc`.

## When to invoke

Before implementing or releasing background jobs, scheduled tasks, webhooks, email delivery, AI generation, imports, exports, third-party integrations, data pipelines, long-running tasks, or high-value customer actions. This is Gate 5 in `DESIGN_WORKFLOW.md`.

## Required inputs

- The operation or integration under design.
- Current `observability-plan.md`, `background-job-register.md`, `incident-playbook.md`.
- Known state: no error monitor or queue configured; Stripe webhook relies on Stripe retries; DataFast is analytics, not error monitoring; Vercel hosting.
- Redaction rules from `security-and-privacy.mdc`.

## Step-by-step workflow

1. Identify critical operations.
2. Identify failure modes.
3. Define structured logging.
4. Define metrics.
5. Define traces or correlation identifiers where appropriate.
6. Define retries.
7. Define retry limits.
8. Define idempotency.
9. Define failed-job handling.
10. Define alerts.
11. Define alert ownership.
12. Define administrative recovery.
13. Define customer-facing status.
14. Define support diagnostics.
15. Define incident procedures.
16. Define rollout and rollback.
17. Define tests.

Each critical background operation must document: trigger, inputs, idempotency key, expected duration, retry policy, failure threshold, user-visible feedback, recovery method, alert condition, sensitive-data restrictions, and owner.

## Required outputs

- Observability architecture.
- Background-job inventory.
- Logging policy.
- Alert plan.
- Recovery plan.
- Feature-flag plan.
- Incident playbook.
- Support-diagnostics plan.

## Quality gates

- Every retryable operation is idempotent and has a retry limit.
- Every logged operation has explicit redaction (no secrets, tokens, payment details, or private content).
- Every alert has a threshold and a named owner.
- Failed work has a dead-letter or manual recovery path.
- Customer-facing status and support diagnostics expose no internal or cross-tenant data.

## Failure conditions

- A background operation has no recovery path if it fails.
- Logs would capture secrets or sensitive content.
- Retries could double-apply an effect (no idempotency).
- Alerts have no owner, or metrics are tracked that no one will act on.

## Memory updates

- `observability-plan.md`
- `background-job-register.md`
- `incident-playbook.md`
- `production-readiness-scorecard.md`

## Validation procedure

- Confirm each register entry maps to a real planned operation, not a hypothetical one.
- Confirm the logging policy lists concrete fields and concrete forbidden fields.
- Confirm proposed vendors/targets are marked proposed versus implemented.
- Confirm alert ownership is assigned or explicitly marked `[UNRESOLVED]`.

## Explicit limits

This skill designs and documents operational behavior, registers, and playbooks. It does not implement job runners, queues, monitoring vendors, alerting, or infrastructure, and it does not redesign product surfaces. It never invents SLAs, uptime guarantees, or vendor capabilities; unknowns are marked `[UNRESOLVED]`.
