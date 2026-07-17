# Application shell

The authenticated shell is the frame every future product surface hangs from. It is calmer and more operational than the marketing site while staying unmistakably Fajita.

## What is implemented

- Server layout at `src/app/(app)/layout.tsx` authenticates the caller, loads the profile and memberships once, resolves the active organization, computes permissions and the feature map, counts unread notifications, and hands a single serializable context to the client shell.
- Client shell `src/components/app/app-shell.tsx` composes the sidebar, top bar, content region, command palette, mobile navigation, and the toast provider. It owns UI state (sidebar collapse, palette open, mobile nav open).
- Route group boundaries: `loading.tsx` (skeleton), `error.tsx` (recoverable error boundary), `not-found.tsx`.
- Context provider `src/lib/app/app-context.tsx` exposes `useApp()`, `useCan()`, and `useFeature()`.

## Regions

| Region | Component | Notes |
| --- | --- | --- |
| Sidebar | `sidebar.tsx` | Desktop, collapsible, preference persisted in localStorage |
| Top bar | `topbar.tsx` | Breadcrumbs, command trigger, notifications, account menu |
| Mobile nav | `mobile-nav.tsx` | Sheet navigation, org switcher, grouped links |
| Command palette | `command-palette.tsx` | Cmd/Ctrl-K, permission and feature aware |
| Notification center | `notification-center.tsx` | Unread count, list, mark read |
| Account menu | `account-menu.tsx` | Identity, settings, theme, sign out |
| Org switcher | `org-switcher.tsx` | Active org, list, create |
| Toast / dialog | `toast.tsx`, `dialog.tsx`, `confirm-dialog.tsx` | Accessible feedback and confirmation |

## Data-loading discipline

The layout performs profile, membership, active-org, feature, and unread-count reads server side before render. No client component refetches the profile or membership list. Tenant-sensitive data is never cached across users: the layout runs per request and the service-role reads are explicitly scoped by resolved identity.

## Styling

App styling lives in `src/styles/app.css`, imported by `src/app/globals.css`. It reuses the Phase 1 tokens (color, spacing, radius, shadow, type) at a lower decorative temperature. No marketing animation systems are loaded inside the app.

## Deferred

Real product regions (monitors, incidents, status pages, integrations) are reserved in navigation but gated. Billing and support-chat mounts are stubbed for later phases. See `feature-availability.md`.
