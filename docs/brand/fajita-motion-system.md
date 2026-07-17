# Fajita motion system

Version 1.0 · Phase 1

Motion explains hierarchy, causality, state, or personality. Anything else stays still.

## Principles

1. **Nothing moves without cause.** Every animation maps to a state change, a user action, or the thermal narrative.
2. **Interactions confirm fast.** Hover/press/toggle feedback within 80–140ms; component entrances at 240ms.
3. **State moves like temperature.** Status transitions are continuous (420ms, thermal easing), never a hard swap. Heat rises and cools; it does not teleport.
4. **Stillness is the default.** Calm states barely move (slow, subtle pulse); alert states earn faster motion. An operational dashboard is nearly still.

## Tokens

Defined in `src/styles/tokens.css`; keyframes and utilities in `src/styles/motion.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--motion-instant` | 80ms | Hover, press |
| `--motion-fast` | 140ms | Buttons, toggles, tooltips |
| `--motion-medium` | 240ms | Cards, modals, entrances |
| `--motion-slow` | 420ms | Status and thermal transitions |
| `--motion-narrative` | 800ms | Marketing storytelling only; never in the app |
| `--ease-standard` | cubic-bezier(0.2, 0, 0, 1) | Interactions |
| `--ease-enter` | cubic-bezier(0, 0, 0.2, 1) | Things appearing |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Things leaving |
| `--ease-thermal` | cubic-bezier(0.33, 0, 0.15, 1) | Status/heat changes; the signature curve |
| `--motion-distance-sm/md` | 4px / 12px | Translate distances |
| `--motion-stagger` | 60ms (max total 360ms) | List reveals only |

## Keyframes and utilities

| Name | Behavior | Used for |
| --- | --- | --- |
| `fj-rise-in` / `.fj-animate-rise` | 12px rise + fade | Entrances, confirmations |
| `fj-fade-in` / `.fj-animate-fade` | Fade | Quiet entrances |
| `fj-pulse` | Scale 1 → 1.06 + opacity | The ember heartbeat (mark, observer, live dots) |
| `fj-pulse-fast` | Scale 1 → 1.12 | Verifying and down states only |
| `fj-signal-travel` | Dash offset march | Signals along monitoring lines |
| `fj-cool-down` | Brightness settle | Recovery moments |
| `.fj-interactive` | 140ms color/shadow/translate transitions + 1px press | All controls |
| `.fj-thermal-transition` | 420ms thermal-eased color transitions | Status surfaces, charts |

## Signature motion

**The ember pulse + thermal transition.** The ember dot breathes at the system's rhythm (slow when calm, fast when verifying or down), and every status change is a continuous thermal color transition. This pair is ownable: it restates the brand promise (constant watch, controlled heat) and cannot transfer to an unrelated SaaS. Reduced-motion alternative: pulse stops, transitions become instant, state reads via color + icon + label.

## Choreography by category

**Micro:** hover 80ms, press adds 1px translate, focus ring instant (never animated), toggles 140ms, tooltips 140ms fade, form feedback 240ms rise.

**Component:** cards/modal entrances 240ms rise; charts draw once on entry (bars fade in, no wiggling after); monitor rows thermal-transition on state change; alert chips rise in.

**Narrative (marketing only):** Thermal Stack journey (3s per state via controller), section reveals at most once per section, 800ms budget, triggered on scroll into view, never scroll-linked scrubbing.

**Brand:** logo ember pulse 2.8s (opt-in, `animated` prop); loading = ember pulse on the mark; status transitions per above.

## Stillness map (never animates)

Body text, headings after entrance, borders, focus rings (appear instantly), tables while reading, status pages during active incidents (only the state color transitions), anything in an email, the app during normal reading.

## Prohibitions

Scroll hijacking; constant floating; parallax; cursor effects; text scrambling; animating every element; entrance staggers beyond 360ms total; blur animation; layout-shifting motion (transform/opacity only); autoplaying narrative above the fold that delays comprehension; motion as the only carrier of meaning.

## Reduced motion and mobile

`prefers-reduced-motion: reduce` globally collapses animation durations to 0.01ms (`motion.css`) and specifically stops the ember pulse, signal travel, and journey autoplay (the controller checks the media query before starting). Mobile: the Thermal Stack uses `simplified` composition; narrative motion is shortened or removed; no hover-dependent meaning.

## Library decision

CSS only. No Framer Motion, no GSAP, no Lottie. The signature system is achievable with transforms, opacity, and dash offsets; a motion library would add bundle cost without new capability. Revisit only if a later phase needs orchestrated timeline sequencing that CSS cannot express.

## Performance budget

Animation must not add jank on mid-range mobile: transform/opacity/filter only, no animated layout properties, no more than 3 simultaneous infinite animations per viewport (ember pulse, signal travel, and one state transition), and complex narrative components lazy-load below the fold.
