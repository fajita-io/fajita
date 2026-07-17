# Fajita email branding

Version 1.0 · Phase 1 · Visual foundation only; sending ships in a later phase (Resend planned; see `lifecycle-communications.mdc`).

## Identity

- Header: horizontal logo at 110px wide on cream, above a 3px ember rule (`public/brand/email/email-header.svg` for clients that need an image header; inline SVG-as-img with PNG fallback in production templates).
- Typography: system stack only (`-apple-system, "Segoe UI", helvetica, arial, sans-serif`). Web fonts are unreliable in email clients; hierarchy comes from size and weight.
- Colors: cream background `#fffdf7`, carbon text `#17130e`, ember button `#b53a0a` with white label (5.88:1), muted footer `#5c544a`. Status categories use the state text colors from the color system.
- Layout: single 560px column, table-based, 32px side padding, mobile-safe.
- Footer: company block per `company.mdc` (Fajita · 1001 S Main St, Ste 600, Kalispell, MT 59901), reason-for-receiving line, preference link.

## Register by template

| Template | Register | Graphics |
| --- | --- | --- |
| Welcome | Warm, one heat line allowed | Logo header only |
| Monitor activated | Plain confirmation + next step | Logo header only |
| Incident opened | Urgent, factual, zero decoration, category label in pepper | Logo header only, no illustration |
| Incident resolved | Calm, factual, duration + summary | Logo header only |
| SSL certificate warning | Plain, dated, actionable | Logo header only |
| Cron heartbeat missed | Plain: last heartbeat time, expected interval | Logo header only |
| Weekly uptime report | Quietly proud; numbers first (tabular) | Small uptime strip image permitted |
| Status-page subscription confirmation | Minimal; customer brand context | Customer-first header |
| Affiliate welcome | Marketing register (Jester allowed lightly) | Header + one illustration allowed |

Prototypes for the two register extremes (incident opened, welcome) render in the Brand Lab email section.

## Rules

- One dominant action per email; button is a padded table cell (bulletproof), 44px min height
- Plain-text alternative required for every template, written (not auto-stripped garbage)
- Subject lines: no sensitive detail, no fake urgency, no emoji in operational mail
- Urgent alerts contain zero decorative graphics; speed of comprehension is the design
- Accessible: semantic heading order, alt text, 16px minimum body, links underlined
- "Memo compatibility": templates keep a plain header/body/footer structure so future integrations can reuse the body block without the chrome

## Deliverability note

Sender identity, SPF/DKIM/DMARC, and provider wiring are later-phase work (Gate 4, `lifecycle-communication-director`). Nothing in this phase sends mail.
