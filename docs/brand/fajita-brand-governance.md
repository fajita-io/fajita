# Fajita brand governance

Version 1.0 · Phase 1

How the identity stays coherent as the product grows, and how a future owner operates it.

## Authority

- **Permanent creative authority:** `.cursor/rules/fajita-master-directive.mdc` plus the voice rules (`voice-and-boundaries.mdc`, `draper-honeycopy.mdc`). These outrank convenience.
- **Identity change control:** core identity assets (mark, wordmark, palette primitives, type roles, motion signature) change only with an explicit decision logged in `.cursor/design-memory/visual-decisions.md` (superseded entries kept, marked, dated). No silent redesigns.
- **Who may alter core assets:** the repository owner or an agent acting on an explicit owner instruction referencing this document. Routine work may consume tokens and components; it may not redefine them.

## How future components must use the system

1. Consume **semantic tokens only** (`--color-*`, `--text-*`, `--space-*`, `--motion-*`); never primitives, never raw hex/px
2. Reuse primitives in `src/components/design-system/` before writing new ones
3. New status surfaces must use `statusSpecs` (never invent state colors or labels)
4. Logos only via the brand components or `/public/brand/` exports
5. Signature compositions (hero moments) may break token defaults only with a logged exception in `visual-decisions.md`

## Approval workflows

**New illustrations:** follow `fajita-illustration-system.md` language, add a Brand Lab specimen, log the addition. Reject anything that fails the observer rule or reads as stock art.

**Customer-facing copy:** review against `fajita-verbal-identity.md` checklist (banned vocabulary, register table, no em dashes, Jester off during incidents). Voice rules in `.cursor/rules/` are enforced automatically for agent work.

**New icons:** follow the construction rules in `fajita-iconography.md`, verify at 14–16px and in grayscale, show in the Brand Lab.

## Consistency checks

Per release (see `release-quality-gates.mdc`): logo-hidden test on new surfaces; AI-slop test; status states shown with icon + label + color; screenshot review at 1440/1280/1024/768/430/390/360; contrast spot check on any new color pairing; Brand Lab still renders every specimen without errors.

## Deprecating assets

Deprecated assets move out of `public/brand/` (delete; git history preserves provenance), their components gain a removal, and the change is logged. Rejected logo territories stay in `logo-territories.tsx` as internal provenance; they are never shipped and never deleted casually.

## Transfer package (for a future buyer)

Everything an acquirer needs is in-repo and self-contained:

- Strategy and verbal identity: `docs/brand/fajita-brand-strategy.md`, `fajita-verbal-identity.md`
- Identity mechanics: `fajita-logo-system.md` + generation scripts (`scripts/generate-wordmark.ts`, `generate-tagline.ts`, `export-brand-assets.ts`); source fonts are OFL, re-downloadable, gitignored
- Implementation: `src/styles/` tokens, `src/components/brand/` and `src/components/design-system/`
- Living reference: `/internal/brand-lab` (dev-only route)
- Decision history: `.cursor/design-memory/visual-decisions.md`
- Licensing: all fonts OFL 1.1; all artwork original to this repository; no third-party brand assets beyond names used nominatively

No external design tool, subscription, or agency relationship is required to operate or extend the identity.
