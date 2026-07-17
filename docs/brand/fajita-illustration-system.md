# Fajita illustration system

Version 1.0 · Phase 1

Fajita illustrates with **instrument drawings**: precise, technical, monoline scenes of monitored systems under controlled heat. The language extends the logo (boundary frames, pulse lines, the ember observer) and the Thermal Stack (nodes, signals, heat surfaces). It never uses food photography, cartoon mascots, or stock SaaS art.

## Visual language

| Attribute | Rule |
| --- | --- |
| Line | Monoline, 1.5–5 units depending on scale, round caps (identical to icon/logo language) |
| Geometry | Rounded-rectangle boundaries (brand radius ratio), circles for nodes/observers, honest chart geometry |
| Texture | Flat color planes; optional dot-grid (`.fj-heat-grid`) as the only pattern; no grain in vector work |
| Lighting | One warm light source implied by ember glow (radial gradient under heat surfaces only) |
| Perspective | Flat, orthographic. No isometric cities, no 3D renders |
| Gradients | Ember 300 → 500 radial glow under heat surfaces; never on strokes or text |
| Noise | None in UI vectors; subtle noise permitted only in large raster social exports |
| Color | Foundation neutrals for structure, one status/heat accent per scene; max 4 hues per illustration |
| Density | Hero scenes <= 12 elements; spot illustrations <= 5. White space is part of the drawing |
| Motion | Only pulse, signal travel, and thermal transition behaviors from the motion system |

## Categories

1. **Hero-scale brand illustrations:** the Thermal Stack and derivatives (composed scenes of monitored infrastructure).
2. **Product-explainer diagrams:** node-and-signal drawings showing detection, verification, alert delivery, publication.
3. **Editorial article graphics:** single-concept spot scenes (a certificate shield cooling, a cron clock going silent).
4. **Empty-state graphics:** smallest scenes; one boundary, one pulse line, one dot. Calm, never sad.
5. **Integration graphics:** partner marks inside Fajita boundary frames connected by signal lines (partner brand guidelines respected).
6. **Social graphics:** OG/X templates in `public/brand/social/`, carbon background with ember glow.
7. **Decorative textures:** the ember dot-grid only, rate-limited to one instance per page.

## The observer rule

Every illustration may include the ember dot exactly once, as the watching point. Two observers make the scene noise; zero makes it anonymous.

## Accessibility

Illustrations are decorative (`aria-hidden` / empty alt) unless they carry information; explanatory diagrams need a text alternative adjacent or via alt. Contrast of essential strokes >= 3:1 against their background. Motion follows the reduced-motion rules.

## Export standards

Vector-first (SVG, cleaned, no editor metadata, no embedded rasters). Raster exports (social platforms): PNG at 1x/2x from the SVG source via the documented pipeline in `fajita-social-assets.md`. Name pattern: `fajita-<category>-<subject>-<theme>.svg`.

## Approval

New illustration categories or style changes require an entry in `.cursor/design-memory/visual-decisions.md` and a Brand Lab specimen before shipping (see `fajita-brand-governance.md`).
