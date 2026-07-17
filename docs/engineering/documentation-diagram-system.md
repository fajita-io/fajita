# Documentation diagram system

Internal. Original inline SVG diagrams for documentation.

**Date:** 2026-07-17

## Model

Diagrams are referenced by id from content (`diagram(id, caption, description)`)
and rendered by `src/components/docs/diagrams.tsx`. Each diagram is original,
hand-built inline SVG using Fajita design tokens, so it works in light and dark
mode without separate assets and stays crisp at any size.

## Accessibility

Every diagram carries a text `description` used both as the accessible
description and in plain-text and LLM output, so the meaning survives without
the image. Diagrams include visible text labels and do not rely on color alone.
Motion is avoided.

## Current diagrams

| id | Explains |
| --- | --- |
| `monitoring-flow` | Scheduled check to failure, retry, verification, incident or recovery |
| `retry-vs-verification` | Difference between a single-check retry and incident verification |

## Adding a diagram

1. Add a token-based inline SVG case to `diagrams.tsx` keyed by a new id.
2. Provide a concise accessible `description`.
3. Reference it from content with `diagram(...)`.

## Extension

The incident-progression, recovery-confirmation, alert-routing, webhook
delivery, status projection, double opt-in, entitlement, and attribution
diagrams from the phase brief use the same component pattern and are additive.
Concept pages currently carry the equivalent meaning in prose and tables, so
diagrams enhance rather than gate comprehension.
