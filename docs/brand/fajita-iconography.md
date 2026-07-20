# Fajita iconography

Version 1.0 · Phase 1

Two proprietary icon families share the logo's construction language: monoline strokes, round caps and joins, contained geometry. Both are original vector work in this repository.

## Families

### Concept icons (`BrandIcon`, `src/components/design-system/icons.tsx`)

20-unit grid, 1.75 stroke, round caps/joins, currentColor. Branded monitoring concepts:

monitor-http, monitor-api, monitor-ssl, monitor-cron, incident, alert, status-page, subscriber, response-time, uptime, region, webhook, channel-email, channel-slack, channel-discord, tenant-isolation, secret-lock, probe-boundary, data-export, recovery, maintenance.

Alert channels use the `channel-*` family. Security highlights use `tenant-isolation`, `secret-lock`, `probe-boundary`, and `data-export`.

Recurring internal motif: the pulse line and the ember dot reappear inside several glyphs (browser frame contains a pulse; incident is the contained spike with the observer dot), tying icons back to the mark.

### Status icons (`StatusIcon`, `src/components/design-system/status/status-icon.tsx`)

16-unit grid, 2 stroke. Every state has a **distinct shape** so color is never the only signal:

| State | Shape |
| --- | --- |
| Operational | Steady check |
| Degraded | Rising heat bars |
| Verifying | Probe (magnifier circle) |
| Down | Contained spike (the mark's peak) |
| Maintenance | Hex bolt |
| Paused | Pause bars |
| Unknown | Open question |
| Recovering | Falling wave |

## Construction rules

- Grid: 20 (concept) or 16 (status); integer or half-unit coordinates
- Stroke: 1.75 (concept), 2 (status); no fills except deliberate anchor dots
- Round caps and joins everywhere; corner radii echo the mark's boundary
- Optical alignment over mathematical centering (test at 16px)
- One idea per glyph; no compound scenes
- Dark/light compatible by inheriting currentColor
- Motion-compatible: glyphs are single-path-dominant so dash or draw animation is possible later

## Usage

- Branded concepts must use this set. A generic library (for close/chevron/search-type actions) may be added later, but must be visually reconciled (stroke width, cap style) and never mixed within one composition without that reconciliation.
- Icons beside a visible text label are decorative (`aria-hidden`); standalone icons must pass `label`/`labelled` for an accessible name.
- Minimum rendered size 14px; default 16–20px; never scale up beyond 32px (use illustrations instead).
- No cartoon food icons, no emoji as icons, no filled/duotone variants without a documented system extension.

## Adding an icon

1. Sketch on the family grid with family stroke.
2. Check at 14, 16, 20px, both themes, grayscale.
3. Add to the `glyphs` map with a name matching product vocabulary (conventional labels, no food terms).
4. Show it in the Brand Lab icons section.
5. Record the addition in `.cursor/design-memory/visual-decisions.md`.
