# Command palette

Component: `src/components/app/command-palette.tsx`. Opened with Cmd/Ctrl-K or the top-bar trigger; controlled by the shell.

## Commands (Phase 3)

Go to Overview, Team, Profile Settings, Organization Settings, Security Settings, Preferences, Notifications; Switch organization; Toggle theme; Open support; View service status; Sign out.

Commands are derived from the same `nav-model` plus a small set of actions, so they inherit permission and feature gating. No command exists for an unfinished feature.

## Behavior and accessibility

- Accessible combobox dialog with labeled input and grouped results.
- Full keyboard navigation (arrow keys, Enter, Escape).
- Focus restoration to the previously focused element on close.
- Permission-aware, feature-aware, and organization-aware results.
- Mobile entry point via the top bar / mobile nav.
- No hidden destructive actions; sensitive actions route to their confirmation surface rather than firing inline.
- Does not override common browser shortcuts irresponsibly.

## Global search foundation

Search currently spans navigation destinations, settings, team members, and organizations. All queries are tenant-scoped and permission-aware; there is no cross-tenant leakage. Future result types (monitors, incidents, status pages, docs) attach to the same debounced, server-authorized search without a new service. See `../application/navigation.md`.
