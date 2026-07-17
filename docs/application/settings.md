# Settings

Layout: `src/app/(app)/app/settings/layout.tsx` with `settings-nav.tsx`. `/app/settings` redirects to `/app/settings/profile`.

## Profile (`/app/settings/profile`)

Manages display name, timezone, locale foundation, theme, reduced-motion preference, and product/marketing email preferences. Shows verified email, authentication method, and account creation summary. Provider-managed identity (email, password) is handled through Clerk's secure surfaces, not rewritten in app code. Action: `actions/profile.ts`.

## Organization (`/app/settings/organization`)

Gated by `org:update`. Manages name, timezone, and slug (slug via `org:update_slug`). Logo section shows initials fallback and documents that uploads await a configured storage bucket (no unsafe/SVG uploads accepted). Ownership summary shown. Actions: `actions/org.ts`.

## Security (`/app/settings/security`)

Reflects real Clerk capabilities only. Each control is labeled Available, Enabled, Recommended, Unsupported, or Planned. Links to Clerk-hosted management where appropriate. Sign-out-all uses Clerk session management. No fake controls; the app never claims to manage credentials Clerk owns. Component: `security-panel.tsx`.

## Preferences (`/app/settings/preferences`)

Date format, time format, week start, default landing page, and a reserved chart-density preference. Stored in `user_preferences`. Reads via server-only `src/lib/app/preferences.ts`; writes via `actions/preferences.ts`. Theme changes avoid incorrect-theme flash.

## Notifications (`/app/settings/notifications`)

Application/email categories only (not monitoring alerts): product updates, education, marketing. Account and security messages are always on and cannot be disabled. Marketing consent is separate and optional. Reads via `src/lib/app/notification-prefs.ts`; writes via `actions/notification-prefs.ts`.

## Data (`/app/settings/data`)

Export and deletion foundations. See `data-export.md` and `deletion-flows.md`.

## Form system

Server-side validation with Zod on every action; typed `ActionResult`; inline errors; loading and disabled states; double-submit prevention; safe trimming and length limits. Client never renders raw server errors (`actions/shared.ts` maps them to safe copy).
