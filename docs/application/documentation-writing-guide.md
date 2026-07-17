# Documentation writing guide

Internal. How to write Fajita documentation.

**Date:** 2026-07-17

## Principle

Every page helps the reader complete one real task or understand one real
product behavior. If a page does neither, it should not exist.

## Voice

Human, direct, task-focused, accurate. Present tense, active voice. Explain what
the product does, not how it feels.

## Never use

Em dashes. AI filler and superlatives (seamless, effortless, robust, powerful,
supercharge, unlock, leverage, next-generation, best-in-class, game-changing,
set it and forget it, never miss an outage again). Internal implementation
commentary. Unsupported security claims. Absolute claims (never leaks, always,
100 percent). Phase numbers. Competitor names except when accurately naming an
integration.

## Prefer

Specific, verifiable statements. Example: "Fajita retries a failed request
before it begins incident verification," not "Fajita uses a robust and seamless
system to ensure the most accurate monitoring possible."

## Structure

- Task guides: outcome, prerequisites, permissions, plan, steps, verification,
  what happens next, common problems, related pages.
- Troubleshooting: symptom, most likely causes, how to confirm, resolution,
  what Fajita records, when to contact support.
- Concepts: what it is, what it is not, when it matters, related states, common
  misconception, related guides.

## Accuracy

Document only implemented behavior. Do not document SMS, phone alerts, on-call,
AI diagnosis, browser monitoring, SDKs, a public write API, or MCP. Pull plan
limits and permissions from generated tables, never hardcode them.
