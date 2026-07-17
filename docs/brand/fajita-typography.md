# Fajita typography

Version 1.0 · Phase 1

Three commissioned roles. All faces are Google Fonts released under the SIL Open Font License 1.1: legal to self-host and embed. Loading is via `next/font` (self-hosted, subset, `font-display: swap`, metric-matched fallbacks generated automatically). No proprietary font files are shipped.

## Roles

| Role | Face | Why it belongs to Fajita |
| --- | --- | --- |
| Display | **Fraunces** (variable: opsz, SOFT, WONK) | A warm, sharp editorial serif. At opsz 144 with SOFT 0 it is precise and slightly hot-blooded: the calm operator with personality. It is also the source of the wordmark, so every headline echoes the logo. |
| Interface + reading | **Instrument Sans** (variable) | Legible grotesque with enough warmth to sit beside Fraunces. Carries UI chrome, body copy, labels, tables. |
| Technical accent | **Spline Sans Mono** (400, 500) | Endpoints, response times, timestamps, IDs, eyebrows. The "engineer's handwriting" of the brand. Rate-limited: accent, never body. |

Neutral-default fonts (Inter, system-ui) are explicitly rejected as silent defaults (`rejected-patterns.md`).

## Instances and weights

- Display: Fraunces wght 540–560, `opsz 144` for display sizes, `opsz 40` for headings, SOFT 0, WONK 0 always (WONK on is banned; it tips into novelty)
- Interface: Instrument Sans 400 (body), 500 (labels), 600 (emphasis, H3, buttons)
- Mono: 400, 500 only
- Maximum three active weights per view

## Scale (fluid, 360 to 1440)

Defined in `src/styles/typography.css`, consumed via role classes or `src/components/design-system/typography.tsx` components.

| Token | Range | Line height | Tracking | Use |
| --- | --- | --- | --- | --- |
| `--text-display-1` | 44 → 88px | 1.04 | -0.015em | Marketing hero only |
| `--text-display-2` | 34 → 60px | 1.04 | -0.015em | Marketing section openers |
| `--text-heading-1` | 28 → 40px | 1.15 | -0.01em | Page titles, doc H1 |
| `--text-heading-2` | 22 → 28px | 1.15 | -0.01em | Section headings |
| `--text-heading-3` | 19px | 1.15 | 0 | Card titles (Instrument Sans 600) |
| `--text-body-lg` | 17 → 20px | 1.6 | 0 | Ledes |
| `--text-body` | 16px | 1.6 | 0 | Default reading |
| `--text-body-sm` | 14px | 1.6 | 0 | Secondary copy, dense UI |
| `--text-label` | 13px | 1.35 | 0 (0.08em for eyebrow caps) | Labels, badges |
| `--text-caption` | 12px | 1.35 | 0 | Timestamps, footnotes (minimum size; never smaller) |

## Hierarchy by surface

- **Marketing:** expressive. Display 1/2 in Fraunces, mono eyebrows, generous space. Headlines sentence case, `text-wrap: balance`, never all-caps.
- **Application:** operational. Nothing above `--text-heading-1`; Fraunces appears only in page titles and hero metrics (`.fj-metric__value`); everything else Instrument Sans. Scanability wins.
- **Documentation:** `.fj-prose`, measure capped at `--container-reading` (42rem ≈ 68ch), headings in order, generous paragraph rhythm.
- **Status pages:** application hierarchy, one level quieter. No display sizes during incidents.
- **Email:** system font stack (`-apple-system, "Segoe UI", helvetica, arial`); web fonts are unreliable in clients. Hierarchy through size and weight only.

## Numbers

`.fj-numeric` applies `font-variant-numeric: tabular-nums` for uptime percentages, latencies, tables, and charts. Currency and counts use tabular figures whenever vertically stacked. Big "hero" metrics use Fraunces at opsz 72 (see `.fj-metric__value`).

## Loading

- `next/font/google` self-hosts subsets (latin), injects `--font-display`, `--font-sans`, `--font-mono` variables, and generates size-adjusted fallbacks (Georgia/system stacks defined in `typography.css` as manual fallbacks too)
- `font-display: swap`; FOUT accepted, layout shift minimized by metric matching
- Variable fonts keep total font payload to three files; no static weight multiplication

## Accessibility

Body minimum 16px, captions 12px floor, line height >= 1.35 everywhere, reading measure 45–75 characters, no all-caps body text, no justified text.
