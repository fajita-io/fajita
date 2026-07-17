import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost";

interface BrandButtonBaseProps {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  children: ReactNode;
}

function buttonClass(variant: ButtonVariant, size: "md" | "sm", extra?: string) {
  return [
    "fj-button",
    `fj-button--${variant}`,
    size === "sm" ? "fj-button--sm" : null,
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function BrandButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BrandButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={buttonClass(variant, size, className)}>
      {children}
    </button>
  );
}

export function BrandButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BrandButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...rest} className={buttonClass(variant, size, className)}>
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

interface CardProps {
  children: ReactNode;
  variant?: "default" | "editorial" | "inset";
  className?: string;
  style?: CSSProperties;
}

export function BrandCard({ children, variant = "default", className, style }: CardProps) {
  const cls = [
    "fj-card",
    variant === "editorial" ? "fj-card--editorial" : null,
    variant === "inset" ? "fj-card--inset" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Demo frame: product UI presentation chrome                          */
/* ------------------------------------------------------------------ */

export function DemoFrame({
  title,
  children,
  className,
  style,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <figure className={`fj-demo-frame${className ? ` ${className}` : ""}`} style={{ margin: 0, ...style }}>
      <div className="fj-demo-frame__bar">
        <svg width="34" height="10" viewBox="0 0 34 10" aria-hidden>
          <circle cx="5" cy="5" r="3.5" fill="var(--color-border-strong)" />
          <circle cx="17" cy="5" r="3.5" fill="var(--color-border-subtle)" />
          <circle cx="29" cy="5" r="3.5" fill="var(--color-border-subtle)" />
        </svg>
        <span className="fj-demo-frame__title">{title}</span>
      </div>
      <div className="fj-demo-frame__body">{children}</div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Metric                                                              */
/* ------------------------------------------------------------------ */

export function Metric({
  value,
  label,
  className,
  style,
}: {
  value: string;
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      <div className="fj-metric__value fj-numeric">{value}</div>
      <div className="fj-metric__label">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chips, tiles, code                                                  */
/* ------------------------------------------------------------------ */

export function ChannelChip({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span className={`fj-chip${className ? ` ${className}` : ""}`}>
      {icon}
      {children}
    </span>
  );
}

export function IntegrationTile({
  name,
  icon,
  className,
}: {
  name: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div className={`fj-integration-tile${className ? ` ${className}` : ""}`}>
      {icon}
      <span>{name}</span>
    </div>
  );
}

export function CodeBlock({
  children,
  label,
  className,
}: {
  children: ReactNode;
  /** Accessible description, e.g. "Example monitor configuration". */
  label?: string;
  className?: string;
}) {
  return (
    <pre className={`fj-code${className ? ` ${className}` : ""}`} aria-label={label}>
      <code>{children}</code>
    </pre>
  );
}

export function ThermalDivider({ className }: { className?: string }) {
  return <hr className={`fj-thermal-divider${className ? ` ${className}` : ""}`} />;
}

/* ------------------------------------------------------------------ */
/* Tooltip (CSS-only, hover + focus)                                   */
/* ------------------------------------------------------------------ */

export function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`fj-tooltip${className ? ` ${className}` : ""}`}>
      {children}
      <span role="tooltip" className="fj-tooltip__bubble">
        {content}
      </span>
    </span>
  );
}
