# Approved direction

**Status:** Approved (Phase 1 brand identity directive, 2026-07-16)

The master creative directive (`fajita-master-directive.mdc`, 0.0) is **approved and permanent**. The visual territory below was developed and implemented during Phase 1 under an explicit user directive that mandated the full brand identity build. Full documentation lives in `docs/brand/` and is demonstrated at `/internal/brand-lab`.

---

## Direction name

**The Held Pulse.** A live system pulse held inside a protective boundary, with a single warm ember dot as the ever-present observer. Controlled heat under constant watch.

## Approval status

- Master directive 0.0: **Approved, permanent** (2026-07-16)
- Visual territory: **Approved** (Phase 1 user directive, 2026-07-16). Marketing-site composition beyond the holding page remains open for Phase 2 exploration within this territory.

## Strategic idea

**Fajita watches software before it gets too hot.** Premium uptime monitoring with an unforgettable creative platform. World-class ($1M+ feel) strategy, identity, illustration, animation, interaction, copy, and production quality.

## Central metaphor

Heat, pressure, timing, smoke, ignition, cooling, and controlled energy interpreted through a sophisticated technology lens. Intelligent and restrained. Never a restaurant, mascot, or food joke.

## Emotional tone

Sharp, confident, observant, fast, slightly mischievous, technically competent, calm during emergencies. The person in the room who notices the smoke before anyone else smells it.

## Quality benchmark

Framer.com is the polish benchmark (spatial composition, typography, product storytelling, interaction quality). Extract principles only. Zero reproduction of Framer structure, components, copy, or identity. Target reaction: "as polished as Framer," never "a Framer clone."

## Visual principles

- Expansive layouts with disciplined negative space
- Oversized, meticulously composed typography
- Product interfaces presented as visual storytelling
- Interactive demonstrations instead of static screenshots
- Subtle depth, layering, shadows, blur, and lighting
- Premium restraint over visual clutter
- Heat gradients strategic, never washing every section in orange

## Composition

Editorial, warm-paper surfaces (cream, not white) with generous negative space on marketing surfaces; calmer, denser, cooler-neutral treatment reserved for the future application. Marketing composition beyond the holding page is Phase 2 work within this territory.

## Typography

Three commissioned roles, all Google Fonts (OFL/permissive, subset via `next/font`):

- **Fraunces** (display): warm, sharp serif with optical sizing; carries editorial headlines and the wordmark source.
- **Instrument Sans** (interface/body): legible, contemporary, quietly characterful.
- **Spline Sans Mono** (technical accent): endpoints, response times, tabular data.

Fluid scales, role-based classes in `src/styles/typography.css`, tokens documented in `docs/brand/fajita-typography.md`.

## Color behavior

Implemented as a three-layer token system (`tokens.css` primitives → `themes.css` semantics → component consumption). Families: soot/carbon foundation, warm cream paper, ember (brand heat), amber (verifying/degraded), pepper red (confirmed down), operational green (kept legible and distinct from decorative heat colors), teal (maintenance/paused), cool blue accents. Light and dark themes both WCAG AA verified; contrast table in `docs/brand/fajita-color-system.md`. Heat gradients strategic, never ambient.

## Graphic devices

- The **ember dot**: single warm point that appears in the mark, as the tittle of the wordmark's j, and as the observer inside the Thermal Stack.
- The **held pulse waveform**: a monitored signal line inside a rounded protective boundary.
- **Thermal Stack**: layered infrastructure diagram with heat surface, service nodes, and alert rail.
- Heat-grid pattern and thermal divider as restrained texture. All custom, no icon packs as brand expression.

## Identity system (required deliverables)

**Delivered.** Final mark: **The Held Pulse** (system pulse inside a rounded protective boundary, ember dot at the crest). Selected after six documented territories (see `docs/brand/fajita-logo-system.md` and the Brand Lab explorations section). Custom wordmark set in Fraunces converted to baked SVG paths with a dotless j carrying the ember dot as its tittle. All lockups exist: horizontal, stacked, mark-only, mono, dark/light, small-size optical variant, favicon (`src/app/icon.svg`), app icon, social avatar, OG treatment, powered-by lockup, animated pulse spec with reduced-motion fallback. Components: `FajitaLogo`, `FajitaMark`, `FajitaWordmark`, `FajitaPoweredBy`. Static exports in `public/brand/`.

## Product visualization

Modular interactive demonstrations (create monitor, detect slow response, confirm outage, send alert, publish incident, update status page, resolve incident, review uptime history) with plausible product data. No motionless screenshot piles.

## Motion language

**Delivered (foundation).** Motion tokens in `tokens.css` (durations 120–1200ms, five easings including `--ease-thermal`), keyframes and utilities in `src/styles/motion.css`, global `prefers-reduced-motion` handling, CSS-only implementation (no animation library). Full spec in `docs/brand/fajita-motion-system.md`. Narrative/scroll choreography for the marketing site is Phase 2 work within this spec.

## Signature moment

**Delivered (foundation).** The **Thermal Stack** (`src/components/brand/thermal-stack/`): SVG + CSS animated infrastructure diagram with six states (operational, verifying, degraded, down, recovering, maintenance), state controller with incident-journey autoplay, static fallback, simplified mobile mode, reduced-motion support, typed API, and README with performance notes. Never a long decorative intro; states map one-to-one to real monitoring semantics.

## Marketing expression

Homepage first viewport must communicate: uptime monitoring; monitors websites, APIs, certificates, cron jobs; alerts before customers report; public status pages; clear primary action. Hero: commanding headline ("Know when your software gets too hot." territory), tight support copy, one dominant CTA, one secondary action, animated product narrative, trust signals, no jargon.

## Application expression

Calmer and more operational than marketing; unmistakably Fajita via typography, spacing, proportions, chart language, motion, status treatments, empty states, microcopy, icons, subtle thermal details. Conventional labels: Monitors, Incidents, Status Pages, Alert Channels, Maintenance, Team, Billing, Settings. No food terminology in critical workflows.

## Responsive expression

Every breakpoint individually composed. Mobile receives rewritten spatial hierarchy, simplified animation, touch-friendly interactions, reframed demonstrations, reduced density, fast loading, no clipped mockups, no horizontal overflow.

## Accessibility considerations

WCAG-compliant contrast across states and themes; reduced-motion alternatives for all brand motion; color never the sole status signal; accessible minimum type sizes.

## Known risks

- Metaphor collapse into restaurant/food kitsch (guard: restraint rules, no food terms in workflows)
- Orange wash / heat gradient overuse (guard: strategic gradients only)
- Framer derivativeness (guard: principles-only extraction, originality gate)
- Signature animation delaying comprehension or conversion (guard: first-viewport clarity requirement, performance budgets)

## Explicit non-goals

- Generic SaaS landing template or prebuilt Tailwind dashboard
- Slightly modified component library or AI-generated startup site look
- Mexican restaurant website, childish food mascot, novelty joke product
- Direct imitation of Framer, Linear, Stripe, Vercel, Apple, Notion, Arc
- Collection of unrelated visual effects
- Dark-mode neon "technical" aesthetic without product rationale

---

*Master directive locked. Territory approved and implemented in Phase 1 (identity, tokens, motion foundation, Thermal Stack, Brand Lab). Phase 2 composes the marketing site inside this world; product visualization demos remain to be built then.*
