# Incident playbook

Practical procedure for handling operational incidents affecting Fajita's own service. Governed by `operations-and-observability.mdc`. Update via `operations-and-observability-architect`.

This concerns **Fajita's own reliability**, not customer monitors (which are a product feature). Severity examples are generic. Do not invent company-specific uptime guarantees or SLAs; those are `[UNRESOLVED]` until formally defined.

---

## 1. Detection

How the incident was noticed: alert, error monitor, customer report, or manual observation. Record time and source. (Detection tooling is `[UNRESOLVED]`; see `observability-plan.md`.)

## 2. Initial assessment

What is affected, since when, and blast radius. Confirm it is real (not a monitoring false positive). Identify the owning system (auth, billing, checks, alerts, email, database).

## 3. Severity classification

Example definitions (adjust when formal targets exist):

| Severity | Example meaning |
| --- | --- |
| SEV1 | Broad outage or data-integrity risk; core product unavailable |
| SEV2 | Major feature degraded for many users; billing or alerting impaired |
| SEV3 | Limited or single-tenant impact; workaround exists |
| SEV4 | Minor, cosmetic, or internal-only |

## 4. Containment

Stop the bleeding: disable a failing feature (feature flag), pause a bad job, roll back a deploy, or rotate a leaked secret. Prefer reversible actions.

## 5. Customer impact

Who is affected and how. Is data at risk? Are alerts or billing affected? Note whether the impact is user-visible.

## 6. Communication decision

Decide whether and how to communicate, per `lifecycle-communications.mdc` and `voice-and-boundaries.mdc`. Customer messaging is factual and calm, reveals no internal infrastructure, and never fabricates status. Security incidents follow any applicable notification obligations (`[UNRESOLVED]`, confirm with legal per `legal-drafting.mdc`).

## 7. Recovery

Restore service: deploy fix, replay/reconcile failed jobs (idempotently), reprocess missed webhooks, or restore from backup. Record each action and its time.

## 8. Verification

Confirm the fix with evidence: error rate normalized, jobs draining, affected flows retested. Do not close on assumption.

## 9. Monitoring

Watch for recurrence for a defined window after recovery. Keep heightened alerting until stable.

## 10. Post-incident review

Blameless review: timeline, root cause, contributing factors, what detected/delayed detection, customer impact, and communication effectiveness.

## 11. Corrective action

Concrete follow-ups with owners: add the missing alert, add idempotency, add a test, fix the runbook. Track to completion; feed back into `observability-plan.md` and `background-job-register.md`.

---

## Roles and ownership

Incident commander, communications, and technical owner roles: `[UNRESOLVED]` (no on-call rotation defined). Assign before launch.

## Status

Installation baseline recorded 2026-07-16. Detection tooling, severity targets, notification obligations, and on-call ownership are `[UNRESOLVED]`. Resolve via `operations-and-observability-architect` and Gate 6.
