# Fajita color system

Version 1.0 · Phase 1

The palette is controlled heat on warm neutrals: carbon and cream as the world, ember as the brand's voice, and a disciplined operational ramp for system states. Heat is strategic, never ambient. If every section is orange, nothing is hot.

## Architecture

Three token layers, defined in `src/styles/`:

1. **Primitive** (`tokens.css`): raw values, `--fj-*`. Never used in components.
2. **Semantic** (`themes.css`): purpose-named, theme-aware, `--color-*`. What components consume.
3. **Component** (`components.css`): per-component derivations.

## Foundation primitives

| Name | Token | Hex | RGB | Purpose |
| --- | --- | --- | --- | --- |
| Cream 50 | `--fj-cream-50` | `#fffdf7` | 255 253 247 | Light background primary |
| Cream 100 | `--fj-cream-100` | `#faf5ea` | 250 245 234 | Light background secondary; dark-theme primary text |
| Cream 200 | `--fj-cream-200` | `#f2ead9` | 242 234 217 | Light inset surfaces |
| Cream 300 | `--fj-cream-300` | `#e6dac3` | 230 218 195 | Light borders; dark-theme secondary text |
| Sand 400 | `--fj-sand-400` | `#c8b99d` | 200 185 157 | Strong borders; dark-theme muted text |
| Taupe 500 | `--fj-taupe-500` | `#8a8070` | 138 128 112 | Paused state fills |
| Soot 600 | `--fj-soot-600` | `#5c544a` | 92 84 74 | Light-theme muted text |
| Soot 700 | `--fj-soot-700` | `#3e382f` | 62 56 47 | Light-theme secondary text; dark borders |
| Carbon 800 | `--fj-carbon-800` | `#262119` | 38 33 25 | Dark elevated surfaces |
| Carbon 900 | `--fj-carbon-900` | `#17130e` | 23 19 14 | Light-theme primary text; inverse surfaces |
| Carbon 950 | `--fj-carbon-950` | `#0e0b07` | 14 11 7 | Dark background primary |
| Slate 300/500/700 | `--fj-slate-*` | `#d5d3cd` `#7d7a72` `#45423b` | — | Cool technical grays: unknown state, chart neutrals |

## Brand heat primitives

| Name | Token | Hex | Purpose |
| --- | --- | --- | --- |
| Ember 200 | `--fj-ember-200` | `#ffe3c2` | Heat-soft tint, selection |
| Ember 300 | `--fj-ember-300` | `#ffc078` | Dark-theme brand text and focus |
| Ember 400 | `--fj-ember-400` | `#f5921b` | Dark-theme ember; the mark's dot on dark |
| Ember 500 | `--fj-ember-500` | `#e8590c` | Heat gradients, thermal divider center |
| Ember 600 | `--fj-ember-600` | `#d9480f` | The mark's ember dot on light; large brand accents |
| Ember 700 | `--fj-ember-700` | `#b53a0a` | Primary buttons, light-theme brand text |
| Ember 800 | `--fj-ember-800` | `#8a2c07` | Button hover |
| Amber 300–700 | `--fj-amber-*` | `#ffd43b` `#f0b429` `#9a6700` `#7a5200` | Verification and degradation |
| Pepper 300–700 | `--fj-pepper-*` | `#ffa8a8` `#e03131` `#c92a2a` `#a61e1e` | Confirmed failure only |

## Operational state primitives

Green (`#8ce99a` → `#237032`) for operational, teal (`#63e6be` → `#0b7a5a`) for recovering, blue (`#74c0fc` → `#1864ab`) for maintenance. Operational green is deliberately outside the decorative brand family so a healthy dashboard never reads as marketing.

## Semantic tokens

Each status has three semantic slots per theme:

- `--color-status-<state>` – text-safe (>= 4.5:1 on background primary)
- `--color-status-<state>-bold` – saturated fill for dots, bars, charts
- `--color-status-<state>-soft` – tinted surface behind badges and banners

Plus foundations: `--color-background-primary/secondary/elevated/inset/inverse`, `--color-text-primary/secondary/muted/inverse/on-brand`, `--color-brand-ember/ember-strong/heat/heat-soft/text`, `--color-border-subtle/strong`, `--color-focus-ring`, and chart tokens `--color-chart-*`.

## Measured contrast (WCAG)

Measured with the WCAG relative-luminance formula (script in repo history; re-verify with any contrast checker):

| Pairing | Ratio | Grade |
| --- | --- | --- |
| Carbon 900 on Cream 50 (light text primary) | 18.17:1 | AAA |
| Soot 700 on Cream 50 (secondary) | 11.40:1 | AAA |
| Soot 600 on Cream 50 (muted) | 7.32:1 | AAA |
| Ember 700 on Cream 50 (brand text) | 5.78:1 | AA |
| Green 800 on Cream 50 (operational text) | 6.01:1 | AA |
| Pepper 600 on Cream 50 (down text) | 5.37:1 | AA |
| Amber 700 on Cream 50 (degraded text) | 6.80:1 | AA |
| Blue 700 on Cream 50 (maintenance text) | 5.98:1 | AA |
| Teal 700 on Cream 50 (recovering text) | 5.23:1 | AA |
| White on Ember 700 (primary button) | 5.88:1 | AA |
| Cream 100 on Carbon 950 (dark text primary) | 18.06:1 | AAA |
| Ember 300 on Carbon 950 (dark brand text) | 12.21:1 | AAA |
| Pepper 300 on Carbon 950 (dark down text) | 10.68:1 | AAA |
| Carbon 950 on Ember 400 (dark button label) | 8.42:1 | AAA |

## Status is never color-only

Every state pairs its color with a distinct icon shape (see `fajita-iconography.md`) and a text label. Charts use the `-bold` fills plus a visually hidden text summary (see `UptimeChart`). The amber/ember/pepper ramp is separated by lightness as well as hue for color-vision safety; the Brand Lab includes a grayscale test.

## Approved pairings and prohibitions

**Approved:**

- Ember 700 text/buttons on cream surfaces; Ember 300/400 on carbon surfaces
- Heat gradients (`ember-300 → ember-500`) only in: thermal divider, OG/social backgrounds, Thermal Stack glow, and at most one hero-scale moment per page
- Status soft tints only behind their own status text

**Prohibited:**

- Ember washes over whole sections; orange body text
- Pepper red for anything except confirmed failure (never for brand decoration, sales urgency, or destructive-button styling outside real destruction)
- Operational green in marketing decoration (it means "up," nothing else)
- Red/green as the only differentiator anywhere
- New hex values in components; add a primitive + semantic token or do not ship it
- Purple-blue gradients, neon-on-dark accents (see `rejected-patterns.md`)

## Themes

Light is the marketing default (warm cream world). Dark is first-class and default-capable in the app. Both are complete in `themes.css`; switching is `data-theme` on `<html>`, initialized pre-paint (`src/lib/theme/theme-script.ts`), persisted in localStorage, with `system` following the OS.
