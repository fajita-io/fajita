# Notification center

Table: `notifications`. Actions: `src/lib/app/actions/notifications.ts`. UI: `src/components/app/notification-center.tsx`.

## Model

Each notification belongs to a user (`user_id`), optionally scoped to an organization, with a `category`, `title`, `body`, optional `href` deep link, and `read_at`. RLS restricts reads to the owning user.

## Capabilities

- List with unread count.
- Mark one read; mark all read.
- Deep link to the relevant surface via `href`.
- Empty state and accessible announcements.
- Organization context preserved.

## Categories (foundation)

Invitation, membership change, security event, organization change, data export, deletion request, product update. Future: incident alert, billing alert.

## Safety

- No fake notifications in production; development samples live only in the App Lab.
- Content is rendered as text. No arbitrary HTML is accepted or rendered.
- Unread counts are computed server-side in the app layout and passed through context; the popover loads the list on demand.

## Deferred

Cursor-based pagination for large histories is stubbed at the query layer and lazy-loads; monitoring/billing categories arrive with their phases.
