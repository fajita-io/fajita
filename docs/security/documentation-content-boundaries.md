# Documentation content boundaries

Internal. What may and may not appear in customer-facing documentation.

**Date:** 2026-07-17

## Never public

Repository structure, infrastructure and worker details, worker credentials,
environment-variable names or values, internal admin routes, internal
incident-response procedures, fraud-detection logic, billing-provider secrets,
affiliate fraud rules, monitoring-worker network details, internal database
schemas, internal prompts, tooling instructions, development phase numbers,
proprietary source, and any security control detail that would materially help
an attacker.

## Safe framing of security topics

Explain SSRF and destination restrictions at a high level (why private, reserved,
loopback, and metadata destinations are blocked and how to make an endpoint
monitorable) without publishing bypasses. Describe secret handling as encrypted
at rest with decryption limited to authorized server-side monitoring, without
revealing key architecture. Never claim certifications that do not exist and
never use absolute claims.

## Enforcement

- Writing guide bans internal terms, phase numbers, and unsupported claims.
- The validation script scans the public corpus for internal terms, phase
  numbers, and secret patterns and fails the build on a match.
- Raw routes and LLM files are allowlisted to published, indexable,
  LLM-eligible pages; internal frontmatter (owner, reviewers) is stripped from
  public output.

## Owner separation

Owner and reviewer fields exist in frontmatter for editorial operations but are
never emitted to public routes, the manifest, or the LLM files.
