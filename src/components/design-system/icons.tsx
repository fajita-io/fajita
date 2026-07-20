/**
 * Fajita branded concept icons. Monoline, 20-grid, 1.75px stroke, round
 * caps: the same construction language as the logo mark and status icons.
 * Ordinary interface actions (close, chevron, search) may use a standard
 * library later; these branded concepts must always use this set.
 *
 * Construction rules: /docs/brand/fajita-iconography.md
 */

export type BrandIconName =
  | "monitor-http"
  | "monitor-api"
  | "monitor-ssl"
  | "monitor-cron"
  | "incident"
  | "alert"
  | "status-page"
  | "subscriber"
  | "response-time"
  | "uptime"
  | "region"
  | "webhook"
  | "channel-email"
  | "channel-slack"
  | "channel-discord"
  | "recovery"
  | "maintenance"
  | "overview"
  | "team"
  | "settings"
  | "support"
  | "search"
  | "bell"
  | "plus"
  | "close"
  | "menu"
  | "chevron-down"
  | "chevron-right"
  | "check"
  | "external"
  | "logout"
  | "shield"
  | "palette"
  | "building"
  | "trash"
  | "warning";

const glyphs: Record<BrandIconName, React.ReactElement> = {
  // Browser frame with a live pulse line
  "monitor-http": (
    <>
      <rect x="2.5" y="3.5" width="15" height="13" rx="3" />
      <path d="M2.5 7.5h15" />
      <path d="M5.5 12.5h2l1.5-2.5 1.5 2.5h4" />
    </>
  ),
  // Request/response brackets around the pulse
  "monitor-api": (
    <>
      <path d="M6 3.5L2.5 10 6 16.5" />
      <path d="M14 3.5l3.5 6.5-3.5 6.5" />
      <path d="M7.5 10h1.6l1-1.8 1 1.8h1.4" />
    </>
  ),
  // Certificate shield with a check
  "monitor-ssl": (
    <>
      <path d="M10 2.5l6 2.2v5c0 3.6-2.5 6.1-6 7.8-3.5-1.7-6-4.2-6-7.8v-5z" />
      <path d="M7.2 10l2 2 3.6-4" />
    </>
  ),
  // Clock with a heartbeat sweep
  "monitor-cron": (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.5V10l3 2" />
    </>
  ),
  // The contained spike, flagged
  incident: (
    <>
      <path d="M2.5 14.5h4L10 6l3.5 8.5h4" />
      <circle cx="10" cy="3.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  // Signal leaving the boundary
  alert: (
    <>
      <path d="M7 12.5a6 6 0 0 1 8.5-8.5" />
      <path d="M4.5 15a9.5 9.5 0 0 1 13-13" />
      <circle cx="15" cy="15" r="2.5" />
    </>
  ),
  // Public page with a status dot
  "status-page": (
    <>
      <rect x="3.5" y="2.5" width="13" height="15" rx="2.5" />
      <circle cx="7" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M9.5 6.5h4" />
      <path d="M6.5 10.5h7" />
      <path d="M6.5 13.5h5" />
    </>
  ),
  // Person receiving the signal
  subscriber: (
    <>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 17c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5" />
      <path d="M14.5 4.5a4.5 4.5 0 0 1 3 4" />
    </>
  ),
  // Stopwatch on the pulse
  "response-time": (
    <>
      <path d="M8 2.5h4" />
      <circle cx="10" cy="11" r="6.5" />
      <path d="M10 11l2.6-2.6" />
    </>
  ),
  // Rising trace held steady
  uptime: (
    <>
      <path d="M2.5 16.5h15" />
      <path d="M3.5 12.5l4-4 3 3 5.5-6" />
      <path d="M13 5.5h3v3" />
    </>
  ),
  // Globe with a check point
  region: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15" />
      <path d="M10 2.5c2.4 2.2 3.5 4.7 3.5 7.5s-1.1 5.3-3.5 7.5c-2.4-2.2-3.5-4.7-3.5-7.5s1.1-5.3 3.5-7.5z" />
    </>
  ),
  // Signed payload arriving at your endpoint
  webhook: (
    <>
      <path d="M6.5 5.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5" />
      <path d="M6.5 14v3" />
      <circle cx="6.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <path d="M11 10h6.5" />
      <path d="M15 7.5l2.5 2.5L15 12.5" />
    </>
  ),
  // Envelope for direct mail alerts
  "channel-email": (
    <>
      <rect x="3" y="5.5" width="14" height="9.5" rx="1.5" />
      <path d="M3 6.5l7 4.5 7-4.5" />
    </>
  ),
  // Channel hash for team chat routing
  "channel-slack": (
    <>
      <rect x="3" y="3" width="14" height="14" rx="2.5" />
      <path d="M8 6v8M12 6v8" />
      <path d="M6 9.5h8M6 12.5h8" />
    </>
  ),
  // Embed-style bubble for community chat
  "channel-discord": (
    <>
      <path d="M4.5 4.5h11a1.5 1.5 0 0 1 1.5 1.5v5.5a1.5 1.5 0 0 1-1.5 1.5H9.5L7 15.5V12H4.5a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M7 8h6M7 10.5h4" />
    </>
  ),
  // Wave settling back down
  recovery: (
    <>
      <path d="M2.5 7c2.5 0 3 5 5.5 5s3-2.5 5-2.5 2.5 1.5 4.5 1.5" />
      <path d="M13.5 15.5h4v-4" strokeDasharray="0" />
    </>
  ),
  maintenance: (
    <>
      <path d="M12.7 3.2a4.5 4.5 0 0 0-5.6 5.6L3 13a2 2 0 0 0 2.8 2.8l4.3-4.1a4.5 4.5 0 0 0 5.6-5.6l-2.5 2.5-2.3-.7-.7-2.3z" />
    </>
  ),
  // Grid of watched surfaces
  overview: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" />
    </>
  ),
  team: (
    <>
      <circle cx="7" cy="7" r="2.6" />
      <path d="M2.5 16c0-2.5 2-4.2 4.5-4.2S11.5 13.5 11.5 16" />
      <path d="M13 5.2a2.4 2.4 0 0 1 0 4.6" />
      <path d="M14 11.9c2 .4 3.5 2 3.5 4.1" />
    </>
  ),
  settings: (
    <>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4" />
    </>
  ),
  support: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.7 7.8a2.4 2.4 0 0 1 4.5 1c0 1.6-2.2 1.8-2.2 3.2" />
      <circle cx="10" cy="14.4" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="8.5" cy="8.5" r="5" />
      <path d="M12.5 12.5L17 17" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a4 4 0 0 1 8 0c0 4 1.5 5 1.5 5h-11S6 12 6 8z" />
      <path d="M8.5 16a1.6 1.6 0 0 0 3 0" />
    </>
  ),
  plus: <path d="M10 4v12M4 10h12" />,
  close: <path d="M5 5l10 10M15 5L5 15" />,
  menu: <path d="M3 6h14M3 10h14M3 14h14" />,
  "chevron-down": <path d="M5 7.5l5 5 5-5" />,
  "chevron-right": <path d="M7.5 5l5 5-5 5" />,
  check: <path d="M4 10.5l4 4 8-9" />,
  external: (
    <>
      <path d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16h9a1.5 1.5 0 0 0 1.5-1.5V12" />
      <path d="M11 4h5v5M16 4l-7 7" />
    </>
  ),
  logout: (
    <>
      <path d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
      <path d="M11 10h6M14.5 7.5L17 10l-2.5 2.5" />
    </>
  ),
  shield: (
    <>
      <path d="M10 2.5l6 2.2v5c0 3.6-2.5 6.1-6 7.8-3.5-1.7-6-4.2-6-7.8v-5z" />
    </>
  ),
  palette: (
    <>
      <path d="M10 2.5a7.5 7.5 0 1 0 0 15c1 0 1.5-.7 1.5-1.5 0-.9-.7-1.3-.7-2 0-.6.5-1 1.2-1H14a3.5 3.5 0 0 0 3.5-3.5c0-3.9-3.4-7-7.5-7z" />
      <circle cx="6.5" cy="9" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="9" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  building: (
    <>
      <rect x="4.5" y="3" width="11" height="14" rx="1.5" />
      <path d="M8 6.5h1.5M11 6.5h1.5M8 9.5h1.5M11 9.5h1.5M8 12.5h1.5M11 12.5h1.5" />
      <path d="M8.5 17v-2.2h3V17" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 5.5h11M8 5.5V4h4v1.5M6 5.5l.7 10a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9l.7-10" />
    </>
  ),
  warning: (
    <>
      <path d="M10 3l7.5 13H2.5z" />
      <path d="M10 8v3.5" />
      <circle cx="10" cy="13.6" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
};

export interface BrandIconProps {
  name: BrandIconName;
  size?: number;
  /** Inherits currentColor by default. */
  color?: string;
  /** Accessible name; omit when a text label sits beside the icon. */
  label?: string;
  className?: string;
}

export function BrandIcon({
  name,
  size = 20,
  color = "currentColor",
  label,
  className,
}: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      {glyphs[name]}
    </svg>
  );
}

export const brandIconNames = Object.keys(glyphs) as BrandIconName[];
