---
name: product-ui-art-director
description: >-
  Art direction for fajita-io application UI. Shell, density, hierarchy, states,
  and workflows. Same brand DNA as marketing without decorative excess.
---

# Product UI art director

## Purpose

Art-direct the application so it shares brand DNA with marketing while optimizing for user jobs, frequency, and clarity. Prevent generic dashboard drift.

## When to invoke

- Phase 8 of `DESIGN_WORKFLOW.md`
- Designing app shell, workspace, or core workflows
- When UI resembles Shadcn/Linear clone
- After marketing visual slice is approved

## Required inputs

- Approved brand world and design tokens
- User job map (primary, secondary, rare tasks)
- Route inventory (dashboard, lists, detail, settings, billing, etc.)
- Existing component patterns (if any)

## Step-by-step workflow

### 1. Define shell architecture

- Application shell layout
- Navigation architecture (primary, secondary, contextual)
- Workspace hierarchy (where users live most)
- Information density targets per zone

### 2. Art-direct core patterns

| Pattern | Direction |
| --- | --- |
| Tables | Row rhythm, hover, selection, empty |
| Lists | Density, metadata hierarchy |
| Filters | Placement, chip vs. panel |
| Search | Scope, results layout |
| Forms | Label, error, help text |
| Commands | Palette or slash if applicable |
| AI / chat | Message hierarchy, citations, sources |
| Data viz | Chart personality from brand world |
| Dashboards | What earns top weight |
| Settings | Grouping, danger zones |
| Onboarding | Steps vs. inline |
| Billing / upgrade | Honest hierarchy, no dark patterns |

### 3. Design states

- Empty (actionable, on-brand)
- Loading (stable layout)
- Processing (long operations)
- Success, error, warning
- Notifications

### 4. Power and mobile

- Keyboard behavior and shortcuts
- Mobile behavior (not shrunk desktop)
- Touch targets

### 5. Hierarchy by job frequency

Most frequent jobs get the clearest paths and calmest chrome. Rare jobs can be denser or nested. **No module with equal visual weight everywhere.**

### 6. Prevent failure modes

The product must not become:

- A monochrome collection of cards
- A generic Shadcn dashboard
- Sidebar plus interchangeable panels
- A visual clone of Linear
- A sea of borders
- A page where every module has equal visual weight

## Required outputs

- **App shell spec** (nav, zones, density)
- **Pattern art direction** for core UI types
- **State design notes** (empty, loading, error)
- **Hierarchy map** (job frequency vs. visual weight)

## Quality gates

- [ ] Logo-hidden test passes in app shell
- [ ] Primary user job obvious within 3 seconds
- [ ] Marketing and product share type and color logic
- [ ] Empty and error states designed
- [ ] No card-grid dashboard by default
- [ ] AI/citation surfaces show provenance clearly if applicable

## Failure conditions

- Implementing app before marketing direction approved
- Decorative marketing layouts inside dense workflows
- Equal-weight card modules for everything
- Missing states on core routes

## Design memory updates

| File | What to write |
| --- | --- |
| `approved-direction.md` | Application expression section |
| `visual-decisions.md` | Shell, pattern, and density decisions |

## Do not code yet

Complete after Phase 6 design system exists. Phase 4 may include **one representative product surface** in the visual slice only.

Cross-reference: `design-system-engineer`, `provenance-ux` (user skill if citations), `empty-error-edge` (user skill), `conversion-experience-designer` for upgrade paths.
