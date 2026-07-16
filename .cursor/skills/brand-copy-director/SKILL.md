---
name: brand-copy-director
description: >-
  Copy direction for fajita-io. Strategic compression, confidence, specificity.
  Aligns with Draper + Honeycopy voice. Copy and visuals share one central idea.
---

# Brand copy director

## Purpose

Direct verbal identity so copy and visual design communicate the same central idea. Premium restraint, sharp observations, tangible benefits.

Align with `draper-honeycopy.mdc` and `voice-and-boundaries.mdc`. This skill adds strategic copy architecture; it does not replace hard bans (no em dashes, no AI slop).

## When to invoke

- Phase 3 brand world
- Writing or reviewing headlines, CTAs, pricing, states, onboarding
- When copy and layout diverge
- During QA if messaging is unclear

## Required inputs

- Creative thesis and approved direction
- Conversion map from `conversion-experience-designer`
- Surface inventory
- Existing copy (if any)

## Voice qualities

Combine:

- Strategic compression
- Conversational persuasion
- Confidence without shouting
- Specificity over superlatives
- Premium restraint
- Sharp observations
- Product clarity
- Memorable phrasing

Draw from classic persuasive craft (transformation, strongest truth, tension, tangible benefits) **without** imitating any living writer or advertising figure.

## Reject

- Empty SaaS phrases
- Corporate filler
- Generic AI claims
- Overuse of em dashes
- Excessive rhetorical questions
- False grandiosity
- Vague superlatives
- Feature dumping
- Identical sentence rhythm across sections
- Overly clever copy that hides the product

## Step-by-step workflow

### 1. Message hierarchy

For homepage and key entry pages define:

- Headline (one idea)
- Supporting proposition (one breath)
- Primary CTA (verb + outcome)
- Product proof line
- Objection handling line

### 2. System copy

Draft direction (not final polish unless implementing) for:

- Feature narratives
- Pricing language
- Empty-state language
- Error language
- Onboarding language
- Button language
- Confirmation language

### 3. Vocabulary

- Words the brand owns
- Words to avoid (overlap with `rejected-patterns.md`)
- Case and punctuation conventions

### 4. Read aloud test

If it sounds like LinkedIn, a pitch deck, or a model demo, rewrite.

### 5. Visual alignment check

Headline length must work with `typography-director` scales. CTA verbs must match button treatment.

## Required outputs

- **Message hierarchy** for key surfaces
- **Copy system guide** (voice, vocabulary, patterns per surface)
- **Before/after** for any weak existing copy flagged

## Quality gates

- [ ] Headline is one idea, not three adjectives
- [ ] CTA is verb + outcome, not "Learn more"
- [ ] No banned phrases from `voice-and-boundaries.mdc`
- [ ] No em dashes
- [ ] Copy expressible in approved visual hierarchy
- [ ] Error and empty copy calm and specific

## Failure conditions

- Feature list disguised as headline
- Wit that obscures the product
- Startup deck openers
- Copy that could swap onto any competitor site

## Design memory updates

| File | What to write |
| --- | --- |
| `creative-thesis.md` | Brand promise, vocabulary notes |
| `approved-direction.md` | Voice section |
| `visual-decisions.md` | Headline/CTA patterns, rejected phrases |

## Do not code yet

Finalize message hierarchy before Phase 7 full marketing build. Phase 4 slice needs hero copy direction.

Cross-reference: `draper-honeycopy.mdc`, `conversion-experience-designer`, `editorial-layout`.
