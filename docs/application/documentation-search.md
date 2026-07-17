# Documentation search (application)

Internal. The reader-facing search experience.

**Date:** 2026-07-17

## Behavior

- Opens with Cmd/Ctrl+K or the search trigger.
- Debounced queries hit `/api/docs/search`; the corpus never ships in a page
  bundle.
- Results show title, category, and description; arrow keys move, Enter opens,
  Escape closes.
- Empty state and no-result state are explicit, not a blank panel.

## Analytics (aggregate, redacted)

Client events: search opened, submitted, result selected. Server logs redacted
no-result queries for editorial review. No user identity, monitor URL, secret,
or incident content is sent. Redaction runs before any logging.

## Relevance

Task and troubleshooting pages rank above concept pages for action and error
queries; error codes are indexed as keywords; synonyms and one-edit typo
tolerance widen recall. See `docs/engineering/documentation-search.md`.

## Accessibility

The dialog traps focus, is labeled, and is fully keyboard operable. Results are
a navigable list; the active result is announced through selection state.
