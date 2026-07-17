# Documentation screenshot guide

Internal. Editorial standards for documentation screenshots.

**Date:** 2026-07-17

## When to use a screenshot

Use one when a visual confirms a step or state that words alone cannot. Do not
decorate pages with screenshots that add no information.

## Standards

- Capture from the controlled fixture environment only. Never from a production
  customer account.
- Redact secrets, emails, real domains, and customer data.
- Use `example.com`, `api.example.com`, `status.example.com` and reserved
  identifiers.
- Fixed dimensions and a modern optimized format to avoid layout shift.
- Light and dark where the surface supports both.
- Required alt text and a caption; the meaning must survive without the image.

## Annotations

Allowed: numbered steps, highlight boxes, short labels, pointer lines. Avoid:
arrows everywhere, tiny text, color-only indicators, annotations covering the
UI, informal styling. Annotation meaning must also appear in caption or
surrounding text.

## Current status

The screenshot block, alt-text enforcement, responsive rendering, and
accessible placeholder are implemented. Image capture is deferred until the
fixture environment is stood up; pages read correctly from prose, tables, and
diagrams in the meantime.
