# Maturity memory

Operational memory for Fajita. These files record how the product behaves as a mature SaaS: security, privacy, billing, entitlements, communications, and operations. They are the source of truth for operational decisions, alongside `design-memory/` (visual) and `experience-memory/` (behavioral).

## What this is

- **Living documents** updated as operational decisions are made.
- **Agent-readable** context loaded before implementing sensitive systems.
- **Decision history** that keeps operational behavior aligned with actual code.

## These are not aspirational marketing documents

Everything here must describe reality or clearly marked intent. Security and privacy copy that reaches customers is documentation of what the system actually does. Do not record controls, guarantees, or capabilities that do not exist. When something is planned but not built, say so.

## Read before implementation

| Before you touch | Read | Invoke |
| --- | --- | --- |
| Auth, authorization, workspaces, admin, keys, uploads, AI, export/deletion | `security-model.md`, `data-inventory.md`, `permissions-matrix.md` | `security-and-privacy-architect` |
| Pricing, checkout, subscriptions, entitlements, plan gating | `entitlement-matrix.md`, `billing-state-model.md` | `billing-and-entitlement-architect` |
| Emails, notifications, lifecycle messaging | `communication-map.md`, `notification-policy.md` | `lifecycle-communication-director` |
| Background jobs, webhooks, integrations, imports/exports | `observability-plan.md`, `background-job-register.md`, `incident-playbook.md` | `operations-and-observability-architect` |
| Launch or major operational change | `production-readiness-scorecard.md` (+ all above) | `production-readiness-auditor` |

## Rules for agents

1. **Read the relevant files** before implementing or changing the systems above.
2. **Update after material decisions.** Record the decision, date, and rationale.
3. **Do not silently overwrite** an approved decision. Supersede it: keep the old entry, mark it superseded with date and reason, and link the replacement.
4. **Represent unresolved questions explicitly.** Use `[UNRESOLVED]` for unknown decisions. Never invent facts to fill a gap.
5. **Keep operational decisions aligned with actual code.** If code and memory diverge, fix the divergence or note it as a known gap. Operational documentation disconnected from code is a defect.
6. **Keep internal detail here.** Customer-facing surfaces follow `voice-and-boundaries.mdc` and `brand-constraints.mdc`.

## How decisions are updated

- New decision: add an entry with date and rationale, set its status.
- Changed decision: mark the prior entry superseded (date + reason), add the new one.
- Unknown decision: mark `[UNRESOLVED]` and, where useful, note who or what will resolve it.

## Files

| File | Purpose |
| --- | --- |
| `security-model.md` | Assets, actors, trust boundaries, auth/authz, isolation, secrets, logging, deletion |
| `data-inventory.md` | Every data category, storage, sensitivity, retention, export, deletion |
| `permissions-matrix.md` | Who may do what, by actor and action; deny by default |
| `entitlement-matrix.md` | Capability by plan, limits, enforcement, interface state |
| `billing-state-model.md` | Billing states and their entitlement, product, messaging, and recovery behavior |
| `communication-map.md` | Registry of every communication, its trigger, audience, and policy |
| `notification-policy.md` | Severity, channel, frequency, preference, and exception rules |
| `observability-plan.md` | Critical operations, logging, monitoring, alerts, status behavior |
| `background-job-register.md` | Every background operation and its recovery contract |
| `incident-playbook.md` | Detection through post-incident review |
| `production-readiness-scorecard.md` | Launch gate; status, score, evidence, owner per category |

## Related

- Permanent rules: `security-and-privacy.mdc`, `billing-and-entitlements.mdc`, `lifecycle-communications.mdc`, `operations-and-observability.mdc`
- Skills: `security-and-privacy-architect`, `billing-and-entitlement-architect`, `lifecycle-communication-director`, `operations-and-observability-architect`, `production-readiness-auditor`
- Workflow gates: `DESIGN_WORKFLOW.md` (Gates 1 to 6)
- Trust claims: `.cursor/experience-memory/trust-evidence-register.md`
