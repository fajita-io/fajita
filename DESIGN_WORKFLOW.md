# Design workflow

Practical guide for agents and developers building fajita-io with world-class creative direction. This document defines the **mandatory sequence** for visual work. Do not skip phases.

**Top-level creative authority:** `.cursor/rules/fajita-master-directive.mdc` (0.0). It fixes the product category (uptime monitoring), brand idea, personality, quality bar, and phase-completion quality gate. Every phase below operates inside that directive.

**Operational authority:** the production maturity operating system (`.cursor/maturity-memory/`, the four maturity rules, and the maturity skills) governs how the product behaves, not just how it looks. Its gates are mandatory and appear directly below.

> A premium SaaS experience is defined as much by what happens when something goes wrong as by what happens when everything works.

---

## Production maturity gates (mandatory)

These gates run alongside the creative and experience phases. They ensure Fajita behaves operationally like a mature SaaS. Do not skip them and do not implement the underlying systems until the matching gate is satisfied. Maturity memory lives in `.cursor/maturity-memory/`; permanent rules are `security-and-privacy.mdc`, `billing-and-entitlements.mdc`, `lifecycle-communications.mdc`, and `operations-and-observability.mdc`.

Prefer the smallest coherent system at every gate:

> The goal is not to simulate a large company's complexity. The goal is to achieve a large company's reliability with the smallest coherent system possible.

### Gate 1: After Phase 0, before Phase 1

The production maturity operating system must be installed. Confirm:

- Creative direction is approved
- Product experience thesis is approved
- Primary journeys are known
- Initial architecture is documented
- Maturity files are created
- Unknown operational decisions are clearly marked

Do not implement production systems during this installation gate.

### Gate 2: Before authentication or user data

Invoke `security-and-privacy-architect`. Require approval of:

- Security model
- Data inventory
- Permissions matrix
- Tenant isolation
- Deletion behavior
- Logging restrictions

### Gate 3: Before billing implementation

Invoke `billing-and-entitlement-architect`. Require approval of:

- Product catalog
- Prices
- Entitlement matrix
- Billing state model
- Webhook architecture
- Failed-payment behavior
- Cancellation behavior

### Gate 4: Before lifecycle emails and notifications

Invoke `lifecycle-communication-director`. Require approval of:

- Communication map
- Notification policy
- Trigger definitions
- Suppression rules
- Retry behavior
- Preference behavior

### Gate 5: Before background jobs or external integrations

Invoke `operations-and-observability-architect`. Require approval of:

- Job register
- Idempotency
- Retry behavior
- Failed-job recovery
- Logging
- Alerts
- Customer-visible progress

### Gate 6: Before production launch

Invoke in fresh context: `production-readiness-auditor`, `security-and-privacy-architect`, `billing-and-entitlement-architect`, `operations-and-observability-architect`, and the existing `visual-qa-critic`, `cross-browser-qa-engineer`, and `maintainability-critic`.

No launch may proceed with unresolved blocker or critical findings.

---

## Before any design work

Agents auto-scan per `design-workflow-auto.mdc` (always on). You do not need to paste read instructions into prompts.

On session start and before design work, agents will:

1. Read `DESIGN_WORKFLOW.md` and design-memory + experience-memory files
2. Read permanent design and experience rules in `.cursor/rules/`
3. Detect the current phase and invoke the matching skill
4. Enforce implementation gates (no broad UI until direction is approved)

Manual reminder if auto-scan is skipped: do not implement before understanding approved direction.

## During design work

- Make intentional visual decisions; document material changes
- Preserve previously approved principles
- Prefer one strong idea over fashionable effects
- Evaluate with **screenshots**, not assumptions
- Keep the product understandable; preserve accessibility
- Do not imitate reference sites directly

## After design work

- Run the project; visit relevant routes
- Capture screenshots at required breakpoints
- Fix visible defects
- Update design-memory files
- Log unresolved issues in `critique-log.md`
- Update `experience-memory/` when product behavior, states, or release evidence changes

---

## Experience system (addendum)

The creative system (Phases 1–11 above) defines **how the product looks**.

The experience system (Phases A–G below) defines **how the product behaves**.

Both are mandatory. Neither replaces the other.

Read `.cursor/experience-memory/` before onboarding, navigation, journeys, states, analytics, performance, trust, or release work.

Permanent experience rules: `experience-quality.mdc`, `state-completeness.mdc`, `perceived-performance.mdc`, `trust-and-claims.mdc`, `release-quality-gates.mdc`.

---

## Experience Phase A: Journey architecture

**Invoke:**
- `product-experience-director`
- `conversion-experience-designer`

Map the entire customer journey from discovery through recurring use.

**Gate:** Do this before implementing broad application navigation.

**Updates:** `critical-user-journeys.md`, `experience-principles.md`, `interaction-decisions.md`

---

## Experience Phase B: Interactive proof

**Invoke:**
- `interactive-demo-engineer`
- `content-realism-editor`

Build a realistic, deterministic demonstration of the product's central transformation.

**Gate:** Validate before building multiple secondary marketing sections.

**Updates:** `critical-user-journeys.md`, `interaction-decisions.md`, `trust-evidence-register.md`

---

## Experience Phase C: Activation

**Invoke:** `onboarding-activation-architect`

Define and implement the shortest honest route to first value.

**Updates:** `critical-user-journeys.md`, `analytics-plan.md`, `interaction-decisions.md`

---

## Experience Phase D: State completeness

**Invoke:**
- `interface-state-director`
- `microinteraction-director`

Inventory and implement all critical states and interaction feedback.

**Updates:** `interface-state-inventory.md`, `interaction-decisions.md`

---

## Experience Phase E: Trust and performance

**Invoke:**
- `trust-experience-designer`
- `perceived-performance-engineer`

Validate claims, billing clarity, security explanations, asynchronous behavior, and perceived speed.

**Updates:** `trust-evidence-register.md`, `performance-budget.md`, `interaction-decisions.md`

---

## Experience Phase F: Product intelligence

**Invoke:**
- `data-visualization-director`
- `product-analytics-architect`

Ensure product data is understandable and meaningful outcomes can be measured.

**Updates:** `analytics-plan.md`, `interface-state-inventory.md`, `interaction-decisions.md`

---

## Experience Phase G: Production review

**Invoke in fresh context where possible:**
- `cross-browser-qa-engineer`
- `maintainability-critic`
- `visual-qa-critic`

The implementing agent must not be the only authority declaring work complete.

**Updates:** `release-scorecard.md`, `critique-log.md`, `interface-state-inventory.md`

---

## Vertical slice requirement

Before building the entire website or application, ship **one complete vertical slice**.

The slice must include:

- Marketing entry point
- Primary CTA
- Signup or demo entry
- Onboarding step
- Core product action
- Loading or processing state
- Successful result
- Error or recovery state
- Upgrade or next-action path
- Mobile version
- Analytics events
- Accessibility review
- Screenshot review

**Gate:** Do not scale design across all routes until the vertical slice passes creative QA (Phase 5) **and** experience review (Phases D, E, G partial).

The slice exposes weaknesses in brand, architecture, interaction, states, data flow, responsiveness, performance, trust, and conversion.

---

## Mandatory unicorn-quality product details

Future agents must **evaluate** whether the product needs each item. Do not blindly implement irrelevant features.

### Navigation and orientation

- Persistent sense of location
- Clear active state
- Useful breadcrumbs where appropriate
- Keyboard-accessible command menu where genuinely useful
- Recent items where useful
- Favorites or pinning where useful
- Search that prioritizes likely intent
- Preserved filters and views
- Sensible browser back-button behavior

### Product feedback

- Immediate button feedback
- Saving and saved states
- Autosave status where applicable
- Safe optimistic updates
- Progress for long operations
- Completion confirmation
- Undo where appropriate
- Retry where appropriate
- Background-operation notifications
- Clear stale-data messaging

### High-value product touches

- Thoughtful first-use experience
- Personalized starting point
- Useful defaults
- Contextual next actions
- Persistent work-in-progress
- Keyboard shortcuts for repeated actions
- Copy and export behavior
- Shareable results where strategically valuable
- Deep links
- Human-readable URLs where appropriate
- Graceful data import
- Graceful cancellation and deletion
- Helpful support entry points
- Professional transactional emails

### Interface maturity

- Full empty-state system
- Full loading-state system
- Full error-state system
- Permission-state system
- Plan-restriction system
- Offline or degraded-state handling where relevant
- Responsive tables
- Mobile-safe forms
- Accessible overlays
- Clear destructive-action behavior
- Consistent timestamps
- Consistent number formatting
- Consistent terminology
- Consistent action placement

### Premium details

- High-quality favicon and application icon
- Social preview imagery
- Branded authentication surfaces
- Branded email templates
- Branded loading behavior
- Branded empty states
- Branded error pages
- Thoughtful 404 page
- Thoughtful maintenance page
- Thoughtful status experience
- Purposeful post-footer experience
- Product-specific illustration or graphic devices
- Consistent screenshots across marketing and documentation
- Polished print and export output where applicable

---

## Product experience scoring

Extend visual QA with journey-level scores (1–10):

- Immediate comprehension
- Product-value communication
- Interaction clarity
- Feedback
- State completeness
- Recovery
- Perceived speed
- Trust
- Accessibility
- Mobile quality
- Visual polish
- Content realism
- Conversion clarity
- Technical stability

**Any critical category below 9 triggers another pass** unless documented in `release-scorecard.md`.

Record scores in `release-scorecard.md` Critical journey experience scores table.

A beautiful page with incomplete functionality does not pass.
A functional workflow with confusing presentation does not pass.
A polished desktop with weak mobile does not pass.

---

## Phase 1: Product understanding

**Goal:** Know what we are designing for.

- Inspect repository (README, routes, copy, config, existing UI)
- Understand the product and primary user job
- Identify audience and conversion goal
- Identify category expectations and competitors (for audit, not imitation)

**Outputs:** Updated `creative-thesis.md` (product, audience, desired action)

**Skills:** None required; feeds `creative-director`

---

## Phase 2: Creative direction

**Goal:** Select a distinct visual territory before building.

**Invoke:**
- `creative-director`
- `reference-deconstruction` (if references supplied)

**Produce:**
- Creative brief
- Category convention audit
- Three genuinely distinct creative territories
- Recommendation
- Initial creative thesis
- Explicit rejected ideas

**Gate:** Do **not** begin broad UI implementation before this phase completes and a direction is selected or clearly recommended.

**Updates:** `creative-thesis.md`, `approved-direction.md`, `rejected-patterns.md`

---

## Phase 3: Brand world

**Goal:** Turn approved territory into a full visual and verbal universe.

**Invoke:**
- `brand-world-builder`
- `brand-copy-director`
- `typography-director`

**Produce:**
- Brand-world specification
- Message hierarchy and copy system
- Type system direction

**Updates:** `approved-direction.md`, `visual-decisions.md`, `creative-thesis.md`

---

## Phase 4: Layout exploration (visual slice)

**Goal:** Prove the direction in a small, high-quality slice.

**Invoke:**
- `editorial-layout`
- `signature-moment-designer`
- `motion-choreographer`

**Prototype only:**
- Navigation
- Homepage hero
- One representative content section
- One product-interface surface
- Primary signature moment

**Gate:** Do **not** build the entire site until this slice is evaluated.

**Updates:** `visual-decisions.md`

---

## Phase 5: Visual slice review

**Invoke:** `visual-qa-critic`

**Actions:**
- Capture screenshots at 1440, 1280, 1024, 768, 430, 390, 360
- Inspect screenshots visually
- Score against creative thesis

**Reject** the direction or implementation if it feels:
- Generic
- Derivative
- Incoherent
- Overdesigned
- Underdesigned
- Difficult to understand
- Like a component-library demo

**Updates:** `critique-log.md`, `rejected-patterns.md` if needed

---

## Phase 6: Design system

**Invoke:** `design-system-engineer`

**Goal:** Encode approved art direction in tokens and primitives without neutralizing distinctiveness.

**Gate:** Only after Phase 5 passes.

**Updates:** `visual-decisions.md`

---

## Phase 7: Full marketing build

Build the complete public experience using:
- Approved creative thesis
- Approved visual direction
- Conversion sequence (`conversion-experience-designer`)
- Responsive art direction plan
- Brand copy system

**Invoke as needed:** `editorial-layout`, `conversion-experience-designer`, `brand-copy-director`

---

## Phase 8: Product UI

**Invoke:** `product-ui-art-director`

Apply the same brand world to the application without sacrificing usability or density requirements.

**Updates:** `approved-direction.md`, `visual-decisions.md`

---

## Phase 9: Responsive art direction

**Invoke:** `responsive-art-director`

Recompose every key route at every required breakpoint. Screenshot evidence required.

**Updates:** `visual-decisions.md`, `critique-log.md`

---

## Phase 10: Final visual QA

**Invoke:** `visual-qa-critic`

Repeat screenshot critique and correction until every critical route reaches **at least 9/10** across:
- Originality, brand coherence, composition, typography, hierarchy
- Product clarity, interaction, motion, responsiveness, accessibility
- Conversion clarity, production polish

**Updates:** `critique-log.md`

---

## Phase 11: Production hardening

Verify:
- Accessibility (focus, contrast, reduced motion, keyboard)
- Browser behavior (spot check Chrome, Safari, Firefox)
- Performance (images, animation)
- Type safety and lint
- Tests if applicable
- Responsive behavior at all breakpoints
- Loading, empty, and error states
- SEO and AI visibility (`seo-ai-visibility.mdc`)
- Pixel-perfect layout, markdown, and Core Web Vitals (`pixel-perfect-quality.mdc`, `layout-perfection-critic`)
- Real interactions only
- No placeholder content or dead controls

See `frontend-quality.mdc` checklist.

---

## Quick skill index

| Skill | Phase |
| --- | --- |
| `creative-director` | 2 |
| `reference-deconstruction` | 2 |
| `brand-world-builder` | 3 |
| `brand-copy-director` | 3, 7 |
| `typography-director` | 3, 6 |
| `editorial-layout` | 4, 7 |
| `signature-moment-designer` | 4 |
| `motion-choreographer` | 4, 6 |
| `visual-qa-critic` | 5, 10 |
| `design-system-engineer` | 6 |
| `conversion-experience-designer` | 3, 7 |
| `product-ui-art-director` | 8 |
| `responsive-art-director` | 9 |
| `layout-perfection-critic` | 11 (auto on CSS/markdown/page changes) |

### Experience skills

| Skill | Phase |
| --- | --- |
| `product-experience-director` | A |
| `interactive-demo-engineer` | B |
| `content-realism-editor` | B |
| `onboarding-activation-architect` | C |
| `interface-state-director` | D |
| `microinteraction-director` | D |
| `trust-experience-designer` | E |
| `perceived-performance-engineer` | E |
| `data-visualization-director` | F |
| `product-analytics-architect` | F |
| `cross-browser-qa-engineer` | G |
| `maintainability-critic` | G |

---

## Existing repository context

This workflow complements (does not replace):
- `AGENTS.md` phased build loop
- `voice-and-boundaries.mdc` and `draper-honeycopy.mdc` for copy
- `legal-drafting.mdc` for legal surfaces
- `seo-ai-visibility.mdc` for organic search and AI discovery on public pages
- Experience rules and `experience-memory/` for product behavior and release gates

Design work stays within phase scope per `AGENTS.md`. Do not expand into infra, auth, billing, or APIs unless that phase explicitly includes them.
