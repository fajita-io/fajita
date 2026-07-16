---
name: trust-experience-designer
description: >-
  Legitimate trust throughout Fajita: pricing, security, billing, AI behavior,
  support. Answer real user questions, not decorative badges.
---

# Trust experience designer

## Purpose

Increase legitimate trust by answering real user questions at the right moments.

## When to invoke

- Experience Phase E in `DESIGN_WORKFLOW.md`
- Adding pricing, signup, checkout, security, integrations, AI features
- Before launch or major marketing claims
- When `trust-evidence-register.md` has gaps

## Inputs

- `trust-evidence-register.md`
- `company.mdc`
- `critical-user-journeys.md`
- `trust-and-claims.mdc`
- Legal drafts if any

## Workflow

### 1. Audit surfaces

Navigation, homepage, demo, pricing, signup, checkout, auth, permissions, integrations, data import, AI behavior, billing, support, legal, security, status, cancellation, data deletion, transactional email.

### 2. Map user questions

Where users ask: Is this real? Secure? Work for me? What happens to data? Can I leave? What will I be charged? Who operates this? Can I get help? What if it fails? Is output trustworthy?

### 3. Assign trust mechanisms

Use only honest mechanisms: real product evidence, process explanations, limitations, security architecture (accurate), retention behavior, billing clarity, cancellation path, support entry, status info, company identity (`company.mdc`), real customer evidence when available, legal summaries + full docs.

### 4. Per surface

Define what question is answered, where, with what evidence. Register in `trust-evidence-register.md`.

### 5. Remove false trust

Strip fake logos, badges, counters, unsupported compliance claims.

## Required outputs

- Trust audit (surface × question × mechanism)
- Gap list with fixes
- Updated trust evidence register
- Copy recommendations (align `draper-honeycopy.mdc` / `legal-drafting.mdc`)

## Quality gates

- [ ] Every marketing claim has evidence row
- [ ] Pricing and renewal clear
- [ ] Contact and company identity visible
- [ ] AI/data handling explained if product uses AI
- [ ] Cancellation path documented

## Failure conditions

- Security badge without verification
- Testimonial without permission
- Pricing hidden or misleading
- Register not updated

## Memory updates

| File | Content |
| --- | --- |
| `trust-evidence-register.md` | All claims and evidence |
| `critical-user-journeys.md` | Trust requirements per journey |

## Validation

Review as skeptical buyer. Can you verify every claim from the page or linked doc?

Cross-reference: `conversion-experience-designer`, `content-realism-editor`, `legal-drafting.mdc`.
