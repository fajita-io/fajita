# Design memory

Living project memory for fajita-io creative direction. These files are the source of truth for what has been decided, rejected, and learned.

## What this is

- **Living documents** updated as the product evolves
- **Agent-readable** context loaded before major visual work
- **Decision history** that preserves creativity without chaos

## Rules for agents

1. **Read all design-memory files** before significant visual changes (see `design-principles.mdc`).
2. **Update after material decisions** (new direction, type choice, layout motif, motion rule, QA finding).
3. **Do not silently overwrite** approved decisions. Supersede with date, reason, and link to replacement.
4. **Do not fabricate** branding facts. Mark fields `[UNRESOLVED]` when unknown.
5. **Keep internal detail here.** Customer-facing surfaces follow `voice-and-boundaries.mdc`.

## Files

| File | Purpose |
| --- | --- |
| `creative-thesis.md` | Why we exist visually; emotional objective; conventions |
| `approved-direction.md` | Selected territory and full direction spec |
| `rejected-patterns.md` | What we will not do |
| `visual-decisions.md` | Decision log with rationale |
| `critique-log.md` | Screenshot QA iterations and scores |

## Recommended workflow

1. **Creative direction** (`creative-director`)
2. **Reference deconstruction** (`reference-deconstruction`) if references supplied
3. **Direction approval** (user selects territory; record in `approved-direction.md`)
4. **Brand-world definition** (`brand-world-builder`)
5. **Typography and layout direction** (`typography-director`, `editorial-layout`)
6. **Signature moment** (`signature-moment-designer`)
7. **Design-system encoding** (`design-system-engineer`)
8. **Product and marketing implementation** (phased per `DESIGN_WORKFLOW.md`)
9. **Responsive art direction** (`responsive-art-director`)
10. **Screenshot QA** (`visual-qa-critic`)
11. **Layout and CWV QA** (`layout-perfection-critic`)
12. **Experience phases A–G** (`experience-memory/`, experience skills)
13. **Final production validation** (`release-scorecard.md`) (Phase 11 in `DESIGN_WORKFLOW.md`)

## Related

- Permanent rules: `.cursor/rules/design-principles.mdc`, `anti-ai-slop.mdc`, `brand-constraints.mdc`, `frontend-quality.mdc`
- Master workflow: `DESIGN_WORKFLOW.md` (repository root)
- Copy voice: `draper-honeycopy.mdc`, `voice-and-boundaries.mdc`
