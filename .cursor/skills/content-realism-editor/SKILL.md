---
name: content-realism-editor
description: >-
  Eliminate placeholder-like Fajita product content. Realistic, consistent,
  deterministic demo dataset across all surfaces.
---

# Content realism editor

## Purpose

Ensure all product content feels real, internally consistent, and product-specific. No lorem ipsum, no repetitive fake names, no fabricated public claims.

## When to invoke

- Experience Phase B in `DESIGN_WORKFLOW.md`
- Before shipping demos, dashboards, empty states, docs examples
- When sample data inconsistent across screens
- `trust-evidence-register.md` flags fake content

## Inputs

- All surfaces with example content
- `trust-and-claims.mdc`
- Product domain (uptime monitoring: monitors, incidents, status pages, alert channels per `fajita-master-directive.mdc`)
- Target customer `[UNRESOLVED]` when unknown

## Workflow

### 1. Audit surfaces

Dashboards, names, companies, projects, metrics, charts, notifications, search results, reports, AI outputs, emails, empty states, errors, tables, dates, activity feeds, integrations, testimonials, docs examples.

### 2. Content rules

Sample content must be:
- Realistic and internally consistent
- Product-specific (monitoring domain: plausible URLs, response times, uptime percentages, incident timelines)
- Useful for understanding product
- Free of fabricated public claims
- Free of lorem ipsum and "John Doe / Acme Corp" repetition
- Appropriate to target customer when known
- Consistent across screens (same demo company, user, timeline)

### 3. Deterministic demo dataset

Create named demo entities (document in skill output and `interaction-decisions.md`):
- Demo user, organization, project names
- Consistent dates and metrics
- Label clearly as example where not live user data

### 4. Fix pass

Replace generic placeholders. Align dates, numbers, and names across routes.

## Required outputs

- Content audit (surface × issue × fix)
- Deterministic demo dataset spec (names, entities, metrics)
- Labeling rules (example vs. live)
- Before/after for worst offenders

## Quality gates

- [ ] Same demo entities used everywhere
- [ ] No lorem ipsum customer-facing
- [ ] Metrics labeled if illustrative
- [ ] AI outputs realistic for product domain
- [ ] Error messages specific

## Failure conditions

- Different fake company name per page
- Testimonial or logo without evidence
- Random metrics implying live data
- Generic "User" / "Item 1" in demo

## Memory updates

| File | Content |
| --- | --- |
| `trust-evidence-register.md` | Example vs. claim labeling |
| `interaction-decisions.md` | Demo dataset reference |

## Validation

Cross-screen consistency check: search demo org name across codebase. Read empty states aloud for specificity.

Cross-reference: `interactive-demo-engineer`, `trust-experience-designer`, `voice-and-boundaries.mdc`.
