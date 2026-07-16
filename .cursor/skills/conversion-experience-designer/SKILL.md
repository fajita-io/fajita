---
name: conversion-experience-designer
description: >-
  Conversion-focused experience design for fajita-io public surfaces. Maps
  awareness, proof, CTA hierarchy, and friction. Experimental design with
  obvious offers.
---

# Conversion experience designer

## Purpose

Protect commercial clarity while allowing experimental art direction. The offer must remain obvious even when the layout is unconventional.

## When to invoke

- Planning or reviewing marketing pages, pricing, signup flows
- Phase 3-7 of `DESIGN_WORKFLOW.md`
- When beauty threatens comprehension
- Before launch or major funnel change

## Required inputs

- Creative thesis and product facts
- Pricing and business model (if known)
- Analytics or assumptions on entry paths (if known)
- Page inventory

## Step-by-step workflow

### 1. Map conversion context

| Dimension | Document |
| --- | --- |
| Visitor awareness | Unaware, problem-aware, solution-aware, product-aware |
| Entry intent | SEO, ad, referral, product-led |
| Primary promise | One sentence |
| Core problem | What hurts |
| Desired outcome | What they get |
| Objections | Price, trust, complexity, switching |
| Proof | Demo, screenshots, metrics (real only), logos (real only) |
| Product demonstration | How they see it work |
| Trust | Policies, security, support |
| Pricing reveal | When and how |
| CTA hierarchy | Primary vs. secondary |
| Commitment level | Free trial, card required, contact sales |
| Conversion friction | Steps to value |
| Upgrade path | Free to paid |
| Post-conversion | First success moment |

### 2. Assign dominant action

Each public page gets **one dominant action**. Secondary actions must not compete visually.

### 3. Sequence information

Logical order: problem → promise → proof → offer → action. Experimental pacing allowed if comprehension checks pass.

### 4. Enforce honesty

Required:

- Clear product understanding
- Clear value proposition
- Visible CTA
- Credible proof
- Honest claims

Forbidden:

- Dark patterns
- Fake urgency or scarcity
- Unsupported metrics
- Visual treatment that obscures pricing or terms

### 5. Test comprehension

Ask: can a new visitor state what the product does and the next step within 10 seconds?

### 6. Align copy and layout

Invoke `brand-copy-director` if message hierarchy diverges from visual hierarchy.

## Required outputs

- **Conversion map** per key page
- **CTA hierarchy diagram**
- **Objection handling notes**
- **Comprehension check** (pass/fail with fixes)

## Quality gates

- [ ] One dominant CTA per page
- [ ] Value proposition visible above fold on key entry pages
- [ ] Pricing honest and findable when applicable
- [ ] Proof uses real data only
- [ ] No dark patterns
- [ ] Experimental layout still passes 10-second comprehension test

## Failure conditions

- Beautiful page that fails product understanding test
- Multiple competing primary buttons
- Hidden pricing on purpose
- Fake social proof

## Design memory updates

| File | What to write |
| --- | --- |
| `creative-thesis.md` | Desired action, audience, business goal refinements |
| `visual-decisions.md` | CTA, proof, and pricing presentation decisions |

## Do not code yet

Complete conversion map before full marketing build (Phase 7). Phase 4 slice must include primary CTA and proof pattern.

Cross-reference: `editorial-layout`, `brand-copy-director`, `conversion` surfaces in `product-ui-art-director`.
