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

## Decision: The Held Pulse identity system

Status: Approved (Phase 1 user directive)
Date or iteration: 2026-07-16
Area: Identity
Decision: Final mark is a system pulse (monitored waveform) held inside a rounded protective boundary with a single ember dot at the crest. Wordmark set in Fraunces, baked to SVG paths, with a dotless j whose tittle is the ember dot. Components enforce controlled props (theme tone, orientation, size, label, motion opt-in); no arbitrary stretching or color overrides.
Reason: Won a six-territory exploration on small-size clarity, motion potential, product-UI and status-page suitability, and maximum distance from restaurant branding. The ember dot gives the system one repeatable observer motif across mark, wordmark, and Thermal Stack.
Alternatives considered: Thermal waveform alone, signal-line F monogram, controlled burner, skillet-as-infrastructure geometry, cool-to-warm signal bar (all documented with verdicts in the Brand Lab and `docs/brand/fajita-logo-system.md`).
Tradeoffs: Abstract mark needs the wordmark nearby during early brand-building.
Implementation implications: All future logo usage goes through `FajitaLogo` / `FajitaMark` / `FajitaWordmark` / `FajitaPoweredBy`. Static exports regenerate via `npm run brand:assets`.
Supersedes: —

---

## Decision: Typography trio (Fraunces, Instrument Sans, Spline Sans Mono)

Status: Approved (Phase 1 user directive)
Date or iteration: 2026-07-16
Area: Typography
Decision: Fraunces (display, optical sizing), Instrument Sans (interface and body), Spline Sans Mono (technical accent). Loaded via `next/font` with subsetting; fluid role-based scale in `typography.css`.
Reason: A warm, sharp serif against a clean grotesque gives the editorial-meets-operational contrast the thesis requires; all three are OFL, safe to ship and transfer to a buyer.
Alternatives considered: Inter-only stack (rejected as generic), licensed commercial display face (rejected: transferability risk for acquisition).
Tradeoffs: Fraunces needs disciplined size/weight control to avoid feeling decorative in dense UI; the app will lean on Instrument Sans.
Implementation implications: Wordmark geometry is baked from Fraunces at build time (`scripts/generate-wordmark.ts`), so logo rendering never depends on webfont loading.
Supersedes: —

---

## Decision: Warm-paper palette with three-layer tokens

Status: Approved (Phase 1 user directive)
Date or iteration: 2026-07-16
Area: Color
Decision: Cream paper (light) and soot/carbon (dark) foundations; ember as the single decorative heat color; amber, pepper red, operational green, and teal reserved for real system states. Primitive tokens (`tokens.css`) feed semantic tokens (`themes.css`); components consume semantics only.
Reason: Warm paper separates Fajita from both dark-neon monitoring cosplay and white SaaS default; strict state-color reservation keeps heat colors meaningful.
Alternatives considered: Dark-first technical palette (rejected: category cliché), broader orange usage (rejected: orange-wash risk).
Tradeoffs: Primary button uses ember-700 (not the brighter 600) in light mode to hold WCAG AA (5.88:1).
Implementation implications: Status colors never appear decoratively; charts use the dedicated `--color-chart-*` set; all pairings and ratios documented in `docs/brand/fajita-color-system.md`.
Supersedes: —

---

## Decision: CSS-only motion foundation, no animation library

Status: Approved (Phase 1 user directive)
Date or iteration: 2026-07-16
Area: Motion
Decision: Motion tokens plus CSS keyframes and utilities; the Thermal Stack animates with SVG + CSS (opacity crossfades, transform-only movement). No framer-motion or GSAP in Phase 1.
Reason: The foundation's needs (pulses, crossfades, signal travel) are cheap in CSS; keeps the shared JS bundle at ~103 kB and static fallbacks trivial.
Alternatives considered: framer-motion (deferred; may be justified for Phase 2 narrative choreography, revisit then).
Tradeoffs: Complex scroll-linked storytelling will need either careful CSS or a library decision in Phase 2.
Implementation implications: Reduced motion handled globally in `motion.css` and per-component; any future library must respect existing tokens.
Supersedes: —

---

## Decision: Public-site content lives in typed sources, gated by flags

Status: Approved (Phase 2)
Date or iteration: 2026-07-16
Area: Content architecture, conversion
Decision: All marketing copy, pricing, claims, FAQs, integrations, changelog, roadmap, and legal listings live in typed modules under `src/lib/site/`. Two central flags gate reality: `accountsOpen` (false; every "Start monitoring" CTA routes to the `/signup` early-access form) and `pricing.published` (false; plans and limits render without dollar amounts). The claims registry (`claims.ts`) assigns every capability a status and tests block copy that markets beyond it.
Reason: Marketing accuracy is a production requirement; centralization lets later phases flip launch state in one place.
Alternatives considered: Copy inline in JSX (rejected: drift and scattered pricing), CMS (rejected: not approved in Phase 0).
Tradeoffs: Adding a page means touching a data module plus a route file.
Implementation implications: `tests/site-content.test.ts` enforces no em dashes, banned words, decentralized pricing, or over-claiming.
Supersedes: —

---

## Decision: Public-site visual layer (fj-site-*) on Phase 1 tokens, SVG-only artwork

Status: Approved (Phase 2)
Date or iteration: 2026-07-16
Area: Marketing surfaces
Decision: The marketing site uses a dedicated `site.css` layer built entirely on Phase 1 primitives and semantic tokens. All product storytelling is hand-built SVG plus CSS motion: hero Thermal Stack narrative (with a `simplified` mobile variant), coverage explorer, nine-step product journey demo, alert-flow visualization, status-page previews, and the footer moment. No raster imagery, video, canvas, or animation library.
Reason: Keeps First Load JS at 103-118 kB, CLS at 0, static fallbacks trivial, and the brand world coherent with Phase 1.
Alternatives considered: framer-motion for scroll choreography (still deferred; CSS covered every Phase 2 need), dashboard screenshots (rejected: no real product yet, and screenshot galleries are banned).
Tradeoffs: Complex future sequences may still force a library decision.
Implementation implications: Demos are marketing simulations in `src/components/site/`; product phases may reference them visually but never import their state.
Supersedes: —

---

## Decision: Shared reading-surface rhythm (`reading.css`)

Status: Approved
Date or iteration: 2026-07-17
Area: Docs, glossary, blog/content, legal prose
Decision: One shared stylesheet (`src/styles/reading.css`) owns shell block padding, index section stacks, article column measure, sticky TOC offset, and prose heading/list/code rhythm for `.fj-docs-prose` and `.fj-prose`. Surface CSS (docs/glossary/content) keeps nav, callouts, and component chrome only.
Reason: Parallel copies of padding and prose margins drifted across docs, glossary, blog, tools, compare, and legal.
Alternatives considered: Per-route spacing tweaks (rejected: ongoing drift).
Tradeoffs: Import order matters; `reading.css` loads after surface sheets so shared rhythm wins.
Implementation implications: New long-form routes wrap body content in `fj-docs-prose` or `fj-prose` and use the reading shell tokens (`--reading-shell-pad-block-*`, `--reading-measure*`).
Supersedes: —

---

## Decision: PH launch layout tokens and container utilities

Status: Approved
Date or iteration: 2026-07-20
Area: Layout system (marketing, reading, app shell)
Decision: Added primitive tokens `--container-wide` (56rem), `--container-narrow` (44rem), touch-target sm/md/lg, and breakpoint aliases (`--bp-nav`, `--bp-stack`, `--bp-compact`). Component utilities: `.fj-container--wide`, `.fj-container--narrow`, `.fj-container--reading`, shared `.fj-sr-only`, cookie consent classes, legal hub and product-journey demo helpers.
Reason: Inline `maxWidth` and mixed 36/40/44px touch targets caused spacing drift across 280+ public routes and the app shell.
Alternatives considered: Per-page inline fixes only (rejected: does not scale).
Tradeoffs: Some signature demo widths (30rem journey cards) remain as component-scoped classes, not global tokens.
Implementation implications: Marketing pages use `fj-page-hero__eyebrow` and container modifiers; app shell uses `--container-marketing` for content max-width; reading `--reading-measure-wide` aliases `--container-narrow`.
Supersedes: —

---

*Add new decisions below as creative direction progresses.*
