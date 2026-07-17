# Powered by Pamphlet

Required on every Ask Fajita surface.

- Component: `src/components/support/powered-by-pamphlet.tsx`
- Link: `https://pamphlet.io` exactly
- No tracking or affiliate parameters
- `rel="noopener noreferrer"` and new tab
- Visible in light/dark and mobile
- Tests fail if attribution URL drifts

Surfaces: launcher panel footer, public `/support`, authenticated `/app/support`, fallback states, support lab, internal support ops footers, conversation export (when generated).
