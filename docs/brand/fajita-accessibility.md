# Fajita brand accessibility

Version 1.0 · Phase 1

Accessibility is a creative constraint of this identity, not an audit performed on it afterward.

## Commitments built into the system

| Area | Implementation |
| --- | --- |
| Contrast | All semantic text tokens measured (WCAG formula) on their approved surfaces: AAA for foundations, AA minimum for brand/status text. Table in `fajita-color-system.md`; specimens in the Brand Lab. |
| Status without color | Every operational state = distinct icon shape + text label + color. Uptime charts carry a visually hidden per-day text summary. Grayscale test rendered in the Brand Lab. |
| Focus | Global `:focus-visible`: 2px ember ring, 2px offset, both themes (`motion.css`). Never removed, never animated. |
| Keyboard | All interactive brand components are native elements (button, a, input, radio) with visible focus; tooltips open on focus-within; theme toggle is a real radio group. |
| Reduced motion | Global collapse in `motion.css`; ember pulse, signal travel, and Thermal Stack autoplay each also check the media query. Static fallbacks exist for every animated component. |
| Semantics | Logo SVGs use `role="img"` + `aria-label` (or `aria-hidden` when decorative). Thermal Stack is a `figure` with aria-label and visible caption. Headings are hierarchical in the Brand Lab and prototypes. |
| Alt text | Informative images get descriptive alt; decorative graphics get empty alt/`aria-hidden`. |
| Data visualization | Charts pair color with geometry and a text alternative; series colors chosen for lightness separation. |
| Target size | Buttons and inputs min-height 44px; small buttons remain 36px with surrounding spacing (used only in dense internal UI). |
| Type | 16px body minimum, 12px absolute floor, line height >= 1.35, measure caps, no all-caps body. |
| Zoom | Fluid layout tokens; Brand Lab verified at 360px width (equivalent stress to 400% zoom on desktop). |
| High-contrast incident states | Down/incident surfaces use the strongest text tokens (5.4:1 to 10.7:1) and never rely on tint alone. |

## Brand Lab demonstrations

The lab shows status states under normal vision, grayscale (CSS filter), dark and light themes, small sizes, and documents the reduced-motion behavior. Mobile composition is verified by screenshot at 360/390/430px.

## Testing

Automated now: color-token availability and status mapping unit tests; contrast values computed by script. Automated later (when routes are real): axe checks in CI, keyboard-path tests via Playwright. Manual per release: keyboard walk of new surfaces, reduced-motion spot check, zoom to 200%.
