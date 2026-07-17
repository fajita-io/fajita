# Documentation navigation

Internal. How readers move through the documentation.

**Date:** 2026-07-17

## Structure

Navigation is generated from the registry by `buildNavigation()`. Pages are
grouped by mental model (Learn, Build, Operate, Reference), then by category,
then by page order. Drafts are excluded; deprecated pages are flagged.

## Surfaces

| Surface | Component | Behavior |
| --- | --- | --- |
| Sidebar | `docs-nav.tsx` | Active link highlight; mobile drawer toggle |
| On-page contents | `toc.tsx` (`DocsToc`) | From page headings; sticky on desktop |
| Breadcrumbs | `toc.tsx` (`DocsBreadcrumbs`) | Docs, category, page |
| Previous/next | `toc.tsx` (`DocsPrevNext`) | Ordered public sequence |
| Related | `toc.tsx` (`DocsRelated`) | From `relatedPages` |
| Search | `search.tsx` | Cmd/Ctrl+K, keyboard navigable |

## Landing page

`/docs` opens with a task-focused hero (start with your first monitor, search),
quick starts, core categories, and popular troubleshooting. No large marketing
hero.

## Mobile

The sidebar becomes a toggle-able drawer; the on-page contents column is hidden
on narrow viewports; previous/next stacks. No horizontal overflow.

## Accessibility

Semantic landmarks, logical heading order, visible focus, keyboard-operable
search and navigation, and non-color state cues.
