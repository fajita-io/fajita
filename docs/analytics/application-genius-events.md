# Genius in-app feedback events

Mounted only in the authenticated app shell (`src/components/genius/`). Never on marketing, docs, auth, or public status pages. Primary entry: sidebar **Share feedback** (Fajita mark). Match modal appearance to `GENIUS_DASHBOARD_BRAND` in `src/lib/genius/config.ts` via the Genius project dashboard.

| Goal | When | Allowed metadata |
| --- | --- | --- |
| `genius_widget_ready` | Genius script finished loading | none |
| `genius_opened` | User opened the widget from a Fajita trigger | `source` (`sidebar`, `command_palette`, `account_menu`, `inline`, `button`, `support_page`), optional `category` |
| `genius_closed` | Programmatic close (reserved) | `source` |
| `genius_submitted` | Successful Genius submission | `category` (`idea`, `confusion`, `bug`, `praise`) |

Forbidden metadata: user email, org name, feedback text, full URLs with query strings, secrets.

Genius receives richer context via `window.Genius.identify`, `setContext`, and `setAccount` (see [Genius widget docs](https://genius.ly/docs/widget)). DataFast goals stay coarse.
