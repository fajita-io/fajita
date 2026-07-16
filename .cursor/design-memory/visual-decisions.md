# Visual decisions

Decision log for fajita-io. Use the format below for every material design choice. Do not delete superseded entries; mark them superseded.

---

## Decision: Design direction precedes component implementation

Status: Approved (system installation)
Date or iteration: 2026-07-16
Area: Process
Decision: No broad UI implementation until `creative-director` completes and a direction is selected or recommended. Phase 4 allows only a visual slice.
Reason: Prevents default AI SaaS aesthetics and ensures strategic coherence.
Alternatives considered: Start from Shadcn/component library (rejected).
Tradeoffs: Slower start, stronger outcome.
Implementation implications: Follow `DESIGN_WORKFLOW.md` phases in order.
Supersedes: —

---

## Decision: Reference principles, not compositions

Status: Approved (system installation)
Date or iteration: 2026-07-16
Area: References
Decision: Learn underlying design logic from references; never copy layout, palette, type pairing, or signature compositions.
Reason: Originality and anti-imitation requirements.
Alternatives considered: "Make it like Linear" (rejected).
Tradeoffs: Requires synthesis effort.
Implementation implications: Use `reference-deconstruction` skill for all references.
Supersedes: —

---

## Decision: Mobile independently art-directed

Status: Approved (system installation)
Date or iteration: 2026-07-16
Area: Responsive
Decision: Each breakpoint gets recomposed layouts, not stacked desktop.
Reason: Mobile is a composed edition of the brand experience.
Alternatives considered: Tailwind stack-only responsive (rejected as sole strategy).
Tradeoffs: More design and QA time per route.
Implementation implications: `responsive-art-director` + screenshot evidence at 360–1440px.
Supersedes: —

---

## Decision: Design system preserves distinctiveness

Status: Approved (system installation)
Date or iteration: 2026-07-16
Area: Design system
Decision: Tokens encode art direction; primitives must not neutralize editorial or signature compositions.
Reason: Systems often average away creative direction.
Alternatives considered: Full generic token-first approach (rejected).
Tradeoffs: Documented exceptions to tokens for hero/signature moments.
Implementation implications: `design-system-engineer` maintains exception register.
Supersedes: —

---

## Decision: Copy voice (existing)

Status: Approved (pre-existing rules)
Date or iteration: Pre-installation
Area: Voice
Decision: Customer-facing copy follows Draper + Honeycopy blend in `draper-honeycopy.mdc`; no em dashes; no AI slop per `voice-and-boundaries.mdc`.
Reason: Established repository voice standards.
Alternatives considered: —
Tradeoffs: Legal surfaces use `legal-drafting.mdc` instead.
Implementation implications: `brand-copy-director` aligns visuals to this voice.
Supersedes: —

---

## Decision: Master creative directive 0.0 adopted

Status: Approved (user directive)
Date or iteration: 2026-07-16
Area: Brand strategy, quality bar, motion, identity, product category
Decision: Adopted the Fajita master creative, brand, design, and motion directive as a permanent always-on rule (`fajita-master-directive.mdc`). It fixes: product category (uptime monitoring for websites, APIs, certificates, cron jobs, with alerting and public status pages), brand idea ("Fajita watches software before it gets too hot"), thermal-metaphor brand world with restraint, brand personality, Framer as a quality benchmark (principles only, zero imitation), required identity-system deliverables, bespoke asset requirement, animated brand world, motion system requirements and prohibitions, homepage first-viewport clarity requirements, approved hero copy territory, typography and color foundations, conventional app labels, responsive/performance/conversion standards, and the phase-completion quality gate.
Reason: Direct permanent instruction from the user; supersedes the earlier citation-product hypothesis.
Alternatives considered: Treating the directive as a one-off prompt (rejected; it must bind every phase).
Tradeoffs: Higher production bar per phase; functional-but-generic work counts as incomplete.
Implementation implications: Visual territory still requires `creative-director` exploration and approval before broad UI. Citation-era analytics goals in `src/lib/analytics/goals.ts` were replaced with monitoring goals (`first_monitor`, `monitor_created`, `alert_channel_added`, `status_page_published`) in the same change.
Supersedes: Citation/provenance product hypothesis in creative thesis and experience memory.

---

*Add new decisions below as creative direction progresses.*
