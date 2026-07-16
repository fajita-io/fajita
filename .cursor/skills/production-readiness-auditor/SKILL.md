---
name: production-readiness-auditor
description: >-
  Fresh-context production readiness audit for Fajita. Invoke before launch and
  after major changes to auth, billing, permissions, data handling, background
  processing, communications, or integrations. Inspects code and config, not
  claims. Blockers and criticals stop launch.
---

# Production readiness auditor

## Purpose

Independently verify that Fajita behaves like a mature SaaS before launch: strong security, correct billing and entitlements, professional communications, and observable, recoverable operations. Audits evidence in code, configuration, and interfaces, not implementation claims.

## When to invoke

Before production launch, and after major changes to authentication, billing, permissions, data handling, background processing, communications, or integrations. This is Gate 6 in `DESIGN_WORKFLOW.md`, run in fresh context alongside `security-and-privacy-architect`, `billing-and-entitlement-architect`, `operations-and-observability-architect`, `visual-qa-critic`, `cross-browser-qa-engineer`, and `maintainability-critic`.

## Required inputs

- The full repository: code, config, env usage, database migrations and RLS, interfaces, and tests.
- All maturity-memory files and existing release scorecards (`release-scorecard.md`).
- The scope of what is being launched or what changed.

## Step-by-step workflow

1. Inspect code, config, environment usage, database behavior, interfaces, and tests directly.
2. Audit each category below against evidence.
3. Classify every finding by severity.
4. Attach evidence to every passing category.
5. Record results and block launch if any blocker or critical is unresolved.

### Audit categories

- **Security:** authentication, authorization, tenant isolation, administrative access, secrets, webhooks, API routes, uploads, data deletion, logging, analytics, AI data handling.
- **Billing:** checkout, subscription state, entitlements, webhooks, idempotency, failed payments, upgrade, downgrade, cancellation, reactivation, usage or credits.
- **Communications:** trigger accuracy, duplicate-send protection, sensitive content, sender identity, mobile rendering, plain-text fallback, preference handling, retry behavior, support path.
- **Operations:** error monitoring, structured logs, job visibility, failed-job recovery, alerts, health checks, feature flags, rollback, incident behavior, support diagnostics.
- **Product experience:** clear user feedback, accurate restricted states, safe error recovery, honest trust claims, professional cancellation, accurate status communication.

## Required outputs

- A categorized findings report with severity classification.
- Evidence for every passing category.
- A launch recommendation (pass or blocked) with the specific blocking issues.

## Quality gates

- Findings are classified: blocker, critical, high, medium, low, or deferred with rationale.
- A launch cannot pass with unresolved blocker or critical issues.
- Every passing category cites concrete evidence (file, config, test, or interface), not a claim.

## Failure conditions

- The audit relies on implementation claims instead of inspecting code.
- A category is marked pass without evidence.
- A known gap (for example, missing webhook idempotency or unpopulated billing cache) is not surfaced.
- Trust claims are accepted without a matching entry in `trust-evidence-register.md`.

## Memory updates

- `production-readiness-scorecard.md`
- Relevant maturity-memory documents.
- Existing release scorecards where applicable (`.cursor/experience-memory/release-scorecard.md`).

## Validation procedure

- Confirm each scorecard line has status, score, evidence, blocking issue, owner, verification method, and last-reviewed date.
- Confirm nothing is marked complete without evidence.
- Re-check the known repository gaps are represented honestly.
- Confirm no application feature was implemented as part of the audit.

## Explicit limits

This skill audits and reports. It does not implement fixes, redesign surfaces, or change application behavior. It records findings in maturity memory and release scorecards and defers remediation to the owning skill and build phase. It never marks a category complete without inspected evidence and never approves launch with open blockers or criticals.
