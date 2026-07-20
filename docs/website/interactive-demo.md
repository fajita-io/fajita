# Interactive product journey (Phase 2)

`src/components/site/home/product-journey.tsx`, rendered on the homepage
at `id="how-it-works"`.

## What it is

A nine-step, hands-on simulation of the complete future Fajita
experience: add a monitor, set the schedule, test the check, choose an
alert channel, publish a status page, simulate a failure, watch the
alert land, resolve, and review uptime history.

## Guarantees

- **No network requests.** All data is deterministic fixtures
  (`genius.ly` demo world). Test-enforced.
- **No user-supplied URLs, no SSRF surface.** Endpoint choices are three
  fixed examples.
- **No backend writes, no account.** The stage footer says
  "Simulation. No account, no requests leave this page."
- **Never claims a real monitor was created.** Stage copy distinguishes
  "in the product this ..." from "here ...".

## Interaction model

- Left rail: nine step buttons (real `<button>`s, `aria-current="step"`,
  done markers). Right stage: `aria-live="polite"`.
- Gated steps: Continue disables until the step's action runs (test
  check, publish, failure, fix). Disabled state is explained by the
  action button sitting directly above.
- Back always available; "Run it again" resets all state on the final
  step; final step hands off to the early-access CTA.
- Keyboard: everything is buttons; no drag, no hover dependence.
- Touch: 44px targets; choice grid wraps on small screens.
- Reduced motion: no animation is required to understand any step; state
  changes are content changes.

## Analytics

- `demo_started` (once per session) on first navigation.
- `demo_completed` (once) on reaching step nine.

## Reuse in later phases

The demo renders product surfaces from shared primitives (`DemoFrame`,
`UptimeChart`, `StatusBadge`, console styles). Application phases should
reference the visual language but must not import marketing simulation
state; the fixture data stays inside `src/components/site/`.

## Other interactive demonstrations

- `HeroNarrative`: eight-beat Thermal Stack incident story (hero).
- `CoverageExplorer`: five monitor types, ARIA tabs (homepage).
- `StatusPagePreview`: five status-page scenarios (homepage + feature pages).
- `AlertFlow`: SVG alert routing animation, CSS-only, reduced-motion safe.
- `FooterMoment`: playable reduced incident loop in the footer.
