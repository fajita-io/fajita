---
name: data-visualization-director
description: >-
  Product data displays for Fajita: metrics, charts, tables. Useful, legible,
  brand-specific. No decorative charts.
---

# Data visualization director

## Purpose

Design data displays that answer user questions and support action. Brand-specific, accessible, honest about freshness and uncertainty.

## When to invoke

- Experience Phase F in `DESIGN_WORKFLOW.md`
- Adding dashboards, metrics, charts, reports, tables with data
- When charts are decorative or misleading

## Inputs

- User question per visualization
- `approved-direction.md` data viz principles
- `interface-state-inventory.md` for loading/empty
- `content-realism-editor` for sample data rules

## Workflow

### 1. Question first

For each viz identify: user question, comparison, time range, baseline, units, freshness, missing data, confidence, action supported.

### 2. Choose format

Prefer number over chart when one number answers the question. Chart when trend, distribution, or comparison needs shape.

### 3. Cover types

Metrics, trends, comparisons, distribution, progress, status, forecasts, confidence, anomalies, attribution, tables, charts, sparklines, scorecards, reports.

### 4. Avoid

- Decorative charts, random line graphs
- Unlabeled axes, misleading scales
- Color-only encoding
- Fake sample metrics as real
- Equal emphasis on every dashboard metric
- Missing freshness when it matters

### 5. Require

- Accessible legends and labels
- Useful tooltips
- Keyboard access where applicable
- Mobile adaptation
- Loading and empty states
- Human-readable numbers
- Clear comparisons
- Export when relevant

### 6. Brand

Apply data viz tokens from brand world. Consistent number formatting app-wide.

## Required outputs

- Viz spec per surface (question, format, data, states)
- Accessibility notes
- Empty/loading/error treatment
- Sample vs. live data labeling

## Quality gates

- [ ] Every chart answers a named question
- [ ] Freshness shown where relevant
- [ ] Mobile usable (scroll, simplify, or reflow)
- [ ] Empty and loading designed
- [ ] No fake metrics without "Example" label

## Failure conditions

- Chart with no user question
- Misleading Y-axis
- Dashboard wall of equal-weight cards
- Sample data presented as live

## Memory updates

| File | Content |
| --- | --- |
| `interface-state-inventory.md` | Data surface states |
| `interaction-decisions.md` | Tooltip, filter, drill behaviors |
| `visual-decisions.md` | Chart personality decisions |

## Validation

Screen reader spot check. Mobile view. Empty and loading forced. Compare number formatting across pages.

Cross-reference: `provenance-ux` (user skill), `interface-state-director`.
