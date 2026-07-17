import { statusSpecs, type OperationalStatus } from "./status";

/**
 * Fajita status icons. Each state has a distinct SHAPE so color is never
 * the only signal (color-blind safe). Monoline, 2px stroke on a 16 grid,
 * round caps, matching the logo's construction language.
 *
 * operational: steady check   degraded: rising heat bars
 * verifying:   probe circle   down: contained spike (the mark's peak)
 * maintenance: hex bolt       paused: pause bars
 * unknown:     open question  recovering: falling wave
 */
const paths: Record<OperationalStatus, React.ReactElement> = {
  operational: <path d="M3.5 8.5l3 3 6-6.5" />,
  degraded: (
    <>
      <path d="M3.5 12.5v-3" />
      <path d="M8 12.5V6" />
      <path d="M12.5 12.5V3.5" />
    </>
  ),
  verifying: (
    <>
      <circle cx="7" cy="7" r="3.75" />
      <path d="M10 10l3 3" />
    </>
  ),
  down: <path d="M2.5 12h3L8 4l2.5 8h3" />,
  maintenance: (
    <>
      <path d="M8 2.5l4.75 2.75v5.5L8 13.5l-4.75-2.75v-5.5z" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  paused: (
    <>
      <path d="M5.5 4v8" />
      <path d="M10.5 4v8" />
    </>
  ),
  unknown: (
    <>
      <path d="M5.5 5.5A2.5 2.5 0 1 1 8 8.5v1" />
      <path d="M8 12.5h.01" />
    </>
  ),
  recovering: <path d="M2.5 5c2 0 2.5 4 5 4s3.5-2.5 6-2.5" />,
};

export interface StatusIconProps {
  status: OperationalStatus;
  size?: number;
  /** Defaults to the status text token. */
  color?: string;
  /** Adds an accessible label; omit when a text label sits beside it. */
  labelled?: boolean;
}

export function StatusIcon({
  status,
  size = 16,
  color,
  labelled = false,
}: StatusIconProps) {
  const spec = statusSpecs[status];
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke={color ?? spec.text}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? "img" : undefined}
      aria-label={labelled ? spec.label : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      {paths[status]}
    </svg>
  );
}
