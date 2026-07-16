---
name: typography-director
description: >-
  Typography art direction for fajita-io. Display, reading, interface, and
  numeric type systems. Screenshot-based type QA. No default Inter without
  strategic justification.
---

# Typography director

## Purpose

Treat typography as a primary design material. Define type roles, scales, and behavior so headlines carry brand personality and reading text stays effortless.

## When to invoke

- Phase 3 brand world or Phase 4 visual slice
- Choosing or changing fonts
- Any page with weak hierarchy, wraps, or generic headlines
- Before `design-system-engineer` encodes type tokens
- During `visual-qa-critic` when type scores below 9

## Required inputs

- Approved direction and brand-world spec
- Content samples (real headlines, body, UI labels, data)
- Breakpoints for responsive type
- Performance constraints (font files, variable fonts)

## Step-by-step workflow

### 1. Define type roles

| Role | Use | Requirements |
| --- | --- | --- |
| Display | Heroes, section openers | Brand character, controlled scale |
| Reading | Long prose, descriptions | Measure, line height, calm rhythm |
| Interface | UI chrome, buttons, nav | Legibility at small sizes |
| Numeric | Tables, charts, pricing | Tabular figures, alignment |
| Monospace | Code, IDs, timestamps | Sparingly; justify each use |
| Serif | If used | Editorial or trust signal; define why |
| Condensed | If used | Display only or labels; define why |
| Italic | Emphasis, quotes | Rate limit |

### 2. Build responsive scales

Define for each role:

- Size steps per breakpoint (1440, 1280, 1024, 768, 430, 390, 360)
- Line height and tracking per size
- Weight hierarchy (limit active weights)
- Case conventions (sentence, title, all-caps rules for labels)
- Line length targets (characters per line)
- Optical sizing adjustments if using variable fonts

### 3. Map surfaces

- Label treatment
- Button treatment
- Navigation typography
- Table typography
- Chart typography
- Number formatting (currency, decimals, thousands)

### 4. Loading strategy

- Font files and subsets
- `font-display` behavior
- Fallback stack that approximates metrics
- FOUT/FOIT acceptance criteria

### 5. Screenshot inspection

Capture and inspect for:

- Weak headline wraps
- Widows and orphans
- Awkward line breaks
- Overly long measures
- Unbalanced centered copy
- Low-contrast secondary text
- Excessive font weights in one view
- Inconsistent vertical rhythm
- Generic typography (could be any SaaS)
- Tiny labels
- Poor numeric alignment

Fix in CSS and content before proceeding.

### 6. Justify defaults

**Do not default to Inter** unless strategically justified in `visual-decisions.md`. Neutral UI fonts are a last resort, not a starting point.

## Required outputs

- **Type system spec** (roles, families, scales, weights)
- **Surface mapping** (nav, buttons, tables, charts)
- **Font loading plan**
- **Screenshot QA notes** with fixes applied

## Quality gates

- [ ] Display type contributes to brand personality
- [ ] Reading measure within 45-75 characters for prose
- [ ] No more than 3 active weights per view
- [ ] Numeric type uses tabular figures where needed
- [ ] Responsive scales defined for all required breakpoints
- [ ] Screenshot inspection completed with no critical wrap failures

## Failure conditions

- Inter/system-ui as silent default
- Display and body from same neutral family without rationale
- Headlines that wrap into accidental comedy
- Tiny gray labels failing contrast
- Type tokens that erase approved display character

## Design memory updates

| File | What to write |
| --- | --- |
| `approved-direction.md` | Typography section finalized |
| `visual-decisions.md` | Font choices, scales, bans |

## Do not code yet

Complete type direction before full-site rollout. Phase 4 slice must demonstrate display + reading + interface harmony.

Cross-reference: `brand-world-builder`, `design-system-engineer`, `editorial-layout`.
