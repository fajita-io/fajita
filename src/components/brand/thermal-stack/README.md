# Thermal Stack

Fajita's signature animated brand object: an abstract monitored system. Service nodes (HTTP, API, SSL, CRON) feed signals into a controlled heat surface; the ember dot above the surface is the observer, the same dot that crowns the logo mark and dots the j in the wordmark.

## Files

| File | Purpose |
| --- | --- |
| `thermal-stack.tsx` | Main scene (server-renderable) plus `ThermalStackStatic` fallback |
| `state-controller.tsx` | Client controller: state switcher and incident-journey autoplay |
| `types.ts` | `ThermalStackState`, per-state spec table, journey sequence |

## API

```tsx
<ThermalStack state="degraded" animated simplified={false} />
<ThermalStackStatic state="down" />
<ThermalStackController autoplay />
```

- `state`: operational, verifying, degraded, down, recovering, maintenance
- `animated`: CSS animation on or off. Reduced-motion users always get static.
- `simplified`: two nodes, no alert rail. Use under ~480px container width.

## State language

| State | Color | Rhythm | Surface |
| --- | --- | --- | --- |
| Operational | Operational green | Slow pulse (3.6s) | Calm wave |
| Verifying | Amber | Fast diagnostic pulse (1.6s) | Tense wave |
| Degraded | Amber | Uneven, slower (2.4s) | Tense wave |
| Down | Pepper red | Urgent (1.2s), alert chip appears | Precise spike |
| Recovering | Teal | Settling (2.8s) | Calm wave |
| Maintenance | Blue | Calmest (4.2s) | Calm wave |

State changes crossfade with `--ease-thermal` over `--motion-slow`: temperature moves continuously, it never teleports.

## Performance notes

- Pure CSS animation: `stroke-dashoffset` travel, `transform: scale` pulse, opacity crossfades. No JS timers in the scene itself, no canvas, no WebGL, no external animation library.
- The SVG is ~4KB and server-rendered; no hydration cost unless the controller is used.
- Waveform switching crossfades three prebuilt paths instead of interpolating path data, which keeps compositing on the GPU.
- Autoplay uses one `setInterval` in the controller only, disabled for reduced-motion users.

## Rules

- Never autoplay the incident journey on a page's first viewport without a user gesture, except in the Brand Lab.
- Never use the "down" state decoratively. It means a confirmed outage.
- The scene must always carry its figcaption or an aria-label; the animation is never the only carrier of meaning.
