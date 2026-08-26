# Design contributions

Fajita's product quality includes visual and interaction craft. Design changes must preserve the existing design system unless an issue explicitly calls for brand work.

## Expectations

- Reuse existing components, tokens, and layout patterns in `src/components/`
- Preserve typography hierarchy and spacing scale
- Preserve motion quality; respect `prefers-reduced-motion`
- Match status color language for healthy, degraded, down, and maintenance states
- Keep marketing and application surfaces visually related but appropriately dense

## Do not

- Introduce generic SaaS template aesthetics (gradient heroes, badge spam, random card grids)
- Swap fonts or color palettes without documented brand approval
- Add decorative motion that delays comprehension
- Ship placeholder links or dead controls on customer-facing surfaces

## Accessibility

- Visible focus states
- WCAG-conscious contrast
- Touch targets ≥ 44px where practical on mobile
- Semantic HTML and meaningful labels

## Pull requests with UI changes

Include:

- Before/after screenshots at desktop and mobile widths
- Note reduced-motion behavior if animation changed
- List routes affected

## Copy

Follow project voice:

- Clear, concise, human, technically precise
- No hype or generic AI copy
- No em dashes in customer-facing strings
- No internal infrastructure detail on customer surfaces

## Related rules

Design memory and brand rules live in repository configuration for maintainers. When in doubt, match surrounding screens and ask in the issue before broad visual refactors.

## Related docs

- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [Development guide](./DEVELOPMENT.md)
