---
name: security-and-privacy-architect
description: >-
  Security and privacy architecture workflow for Fajita. Invoke before
  implementing or changing auth, authorization, workspaces, admin access, API
  keys, integrations, webhooks, uploads, AI processing, or data export and
  deletion. Produces threat model, trust boundaries, data inventory, and tests.
---

# Security and privacy architect

## Purpose

Design the security and privacy behavior of a feature before it is built. Produce a lightweight threat model, trust-boundary map, data inventory, and permissions matrix so that authentication, authorization, entitlements, and administrative privilege stay distinct and server-enforced. Governed by `security-and-privacy.mdc`.

## When to invoke

Before implementing or materially changing: authentication, authorization, workspaces, team membership, administrative access, API keys, integrations, webhooks, file uploads, AI processing, user data export, user data deletion, analytics, or any sensitive product feature. This is Gate 2 in `DESIGN_WORKFLOW.md`, and it re-runs whenever these areas change.

## Required inputs

- The feature or change under design and its user-facing intent.
- Current `security-model.md`, `data-inventory.md`, `permissions-matrix.md`.
- Relevant Phase 0 facts (`creative-thesis.md`, `critical-user-journeys.md`).
- Known architecture: Clerk (auth), Supabase (DB, RLS), Stripe (billing), DataFast (analytics), Vercel (hosting).
- The ten sensitive-feature questions from `security-and-privacy.mdc`.

## Step-by-step workflow

1. Identify assets that require protection.
2. Identify user and system actors.
3. Identify trust boundaries.
4. Identify data categories.
5. Identify permission levels.
6. Identify likely misuse and attack paths.
7. Define authentication behavior.
8. Define authorization behavior.
9. Define tenant isolation.
10. Define data retention.
11. Define deletion behavior.
12. Define logging and redaction.
13. Define recovery and investigation behavior.
14. Define user-facing security explanations.
15. Define test requirements.

Produce a lightweight threat model covering: unauthorized account access, cross-account or cross-workspace access, privilege escalation, insecure direct object references, secret exposure, webhook forgery, replay attacks, abuse and automation, file abuse, prompt injection where AI consumes external content, sensitive-output leakage, administrative misuse, and data-deletion failures.

## Required outputs

- Security architecture.
- Trust-boundary map.
- Data inventory.
- Permissions matrix.
- Threat register.
- Required tests.
- Unresolved risks (explicitly listed, not hidden).

## Quality gates

- Authentication, authorization, entitlements, and admin privilege are separated and never conflated.
- Every protected action has a named server-side check.
- Deny-by-default and ownership checks are specified for each object.
- Tenant isolation is defined for every query, mutation, and file path.
- Redaction rules exist for every log the feature emits.
- Each threat in the register has a mitigation or an explicit accepted-risk note.

## Failure conditions

- The feature relies on client-side-only enforcement.
- A secret or service-role key would reach the browser or public env.
- The design claims security because a vendor is used, without describing the app-side controls.
- The threat model omits tenant isolation or IDOR.
- Unresolved risks are left unstated.

## Memory updates

- `security-model.md`
- `data-inventory.md`
- `permissions-matrix.md`
- `production-readiness-scorecard.md`

## Validation procedure

- Re-read the ten sensitive-feature questions and confirm each is answered or marked unresolved.
- Inspect actual code, config, env usage, and RLS policies (not just intent) for the touched area.
- Confirm the permissions matrix defaults unresolved permissions to denied.
- Confirm no fabricated compliance claim was introduced (`trust-evidence-register.md`).

## Explicit limits

This skill designs and documents security behavior and required tests. It does not implement production auth, billing, or infrastructure, and it does not redesign visual or marketing surfaces. It records decisions in maturity memory and defers implementation to the relevant build phase. It never invents compliance certifications or unverified security claims.
