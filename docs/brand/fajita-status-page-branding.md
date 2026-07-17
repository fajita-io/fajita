# Fajita status-page branding

Version 1.0 · Phase 1 · Visual foundation only; the status-page product ships in a later phase.

The status page is the surface a customer's customers see on the worst day. It must be the calmest thing Fajita makes: instantly readable, boring in the best way, trustworthy under stress.

## Principles

1. **Customer brand first.** The page belongs to the customer (their name, their logo chip, their domain). Fajita appears once, in the quiet powered-by lockup in the footer.
2. **Calmer than everything.** No display typography, no ember decoration, no marketing energy. The application hierarchy, one level quieter.
3. **No animation during incidents.** Active-incident pages are static except thermal color transitions on state change and the live status dot (which stops under reduced motion).
4. **State is unmistakable.** Status badge (icon + label + color), component list, incident narrative with timestamps, uptime history with text alternative.

## Anatomy (prototyped in the Brand Lab)

Header (customer identity + domain) → overall status badge → incident banner when active (title, plain-language narrative, next-update commitment, timeline timestamps) → component list with per-component badges → 90-day uptime strip → email subscribe form → footer (customer copyright + `<FajitaPoweredBy />`).

## Customer customization rules

- Customers may set: logo/brand chip, accent color for their header identity, domain.
- Customer accent color never overrides **status semantics**: operational green, amber, pepper red, maintenance blue come from Fajita tokens and are non-negotiable, because they are the safety language of the page.
- If a customer accent fails 4.5:1 on the page background, it is used only in the decorative header chip, never for text or controls.
- Dark and light status pages both supported; default light (calm, print-friendly).

## Copy register

Guardian only. No heat metaphor, no wit, no exclamation marks. Plain statements: what is affected, what is being done, when the next update comes. Timestamps in UTC plus relative time.

## Fajita attribution

`<FajitaPoweredBy />`: muted text, 16px mark, links to fajita.io. Never larger than the customer's identity. This lockup is also a growth surface; it must earn trust by being modest.
