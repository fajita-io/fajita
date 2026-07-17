# Status page appearance

Route: `/app/status-pages/[id]/appearance` (`AppearanceEditor`).

## Controlled tokens only

No arbitrary CSS, fonts, HTML, or JavaScript ever reaches the renderer. Customers choose from constrained, safe options (`src/lib/status-pages/appearance.ts`):

- Theme: Signal (minimal/technical), Ember (warm/premium), Paper (light editorial), Midnight (dark operational).
- Accent color (hex, contrast-validated).
- Density (comfortable/compact), corner radius (sharp/soft/round), header style (minimal/bordered).
- Logo and favicon (safe uploads with size/dimension/MIME validation; deferred storage wiring documented).

## Color accessibility

`validateAppearance` blocks publication when the accent fails a minimum contrast (≥ 3:1) against the theme background, with a clear explanation. Branding can never make status or link text unreadable. Status is never communicated by color alone.

## Themes

Each theme supports every state (operational, degraded, outage, maintenance, incident), the subscriber form, uptime history, mobile, accessibility, and a customer logo. Themes are original Fajita designs, applied via CSS variables on `.sp-root` with no extra JavaScript.
