# Accessibility review (Phase 2)

## Automated results

Lighthouse accessibility score 1.00 on `/`, `/pricing`, and
`/features/uptime-monitoring` (production build). Vitest suites cover
keyboard behavior for navigation, dropdowns, the product journey demo,
and form labeling.

## Implemented

### Structure

- Semantic landmarks on every route: `header`, `nav`, `main`, `footer`.
- Skip link ("Skip to content") as the first focusable element.
- One `h1` per page; heading levels never skip.
- Sections rely on their own visible headings; no dangling
  `aria-labelledby` references.

### Navigation

- Dropdowns are buttons with `aria-expanded` and `aria-controls`;
  they open on click (no hover requirement), close on Escape and on
  outside click, and return focus to the trigger.
- Mobile menu is a composed panel with scroll lock, Escape to close,
  and an accessible close button.
- Focus states use the Phase 1 focus ring token on every interactive
  element; never removed.

### Interactive demos

- Product journey: every step is a real button, fully operable by
  keyboard; state changes are announced via an `aria-live="polite"`
  region; a text description of the current stage accompanies the
  visual.
- Coverage explorer: tab pattern with `aria-selected`, arrow-key
  support, and content that reads as plain prose without the visual.
- Thermal Stack: `role="img"` with a descriptive label plus an
  adjacent text narration of the monitoring sequence; purely
  decorative layers are `aria-hidden`.

### Status without color

Every status indicator pairs color with a shape or label: operational
(steady dot + label), verifying (ring + label), incident (flare glyph +
label). Charts include text summaries of the values they show.

### Forms

- All fields have visible `label` elements.
- Errors are announced inline (`role="alert"`), inputs get
  `aria-invalid`, and user input is preserved on failure.
- Honeypot fields are `aria-hidden` and removed from the tab order.

### Motion

Global `prefers-reduced-motion: reduce` support: all non-essential
animation stops; demos and the footer moment render their final states
statically with the same information available as text.

## Manual checks performed

- Keyboard-only pass through header, homepage demos, pricing, contact
  form, and footer on the production build.
- 200% zoom spot check on `/` and `/pricing`: no clipped content, no
  horizontal overflow.
- Screen-reader name spot check on nav triggers, logo link ("Fajita,
  home"), and demo controls.

## Known gaps (carry to Phase 3+)

- No axe-core CI integration yet; Lighthouse and unit tests only.
- Screen-reader testing was spot-check level (VoiceOver), not a full
  route-by-route audit.
