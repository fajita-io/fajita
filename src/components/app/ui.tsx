import type { CSSProperties, ReactNode } from "react";

import { BrandIcon, type BrandIconName } from "@/components/design-system/icons";
import type { OrgRole } from "@/lib/auth/roles";

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="fj-page-header">
      <div>
        <h1 className="fj-page-header__title">{title}</h1>
        {description ? (
          <p className="fj-page-header__desc">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="fj-page-header__actions">{actions}</div> : null}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Section card                                                        */
/* ------------------------------------------------------------------ */

export function AppSection({
  title,
  description,
  children,
  footer,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="fj-app-section">
      {title ? (
        <div className="fj-app-section__head">
          <h2 className="fj-app-section__title">{title}</h2>
          {description ? (
            <p className="fj-app-section__desc">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="fj-app-section__body">{children}</div>
      {footer ? <div className="fj-app-section__footer">{footer}</div> : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon = "overview",
  title,
  description,
  action,
}: {
  icon?: BrandIconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="fj-empty">
      <div className="fj-empty__mark" aria-hidden="true">
        <BrandIcon name={icon} size={24} />
      </div>
      <h3 className="fj-empty__title">{title}</h3>
      <p className="fj-empty__desc">{description}</p>
      {action ? <div className="fj-empty__action">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

export function Skeleton({
  width,
  height = "1rem",
  radius = "var(--radius-sm, 6px)",
  style,
}: {
  width?: string;
  height?: string;
  radius?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className="fj-skeleton"
      aria-hidden="true"
      style={{ width: width ?? "100%", height, borderRadius: radius, ...style }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Avatars                                                             */
/* ------------------------------------------------------------------ */

function initials(name: string | null, fallback = "?"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || fallback;
}

export function Avatar({
  name,
  src,
  size = 32,
}: {
  name: string | null;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <img
        className="fj-avatar"
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="fj-avatar fj-avatar--initials"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}

export function OrgAvatar({
  name,
  src,
  size = 28,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <img
        className="fj-org-avatar"
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="fj-org-avatar fj-org-avatar--initials"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initials(name, "F")}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Badges (role, feature availability) - never color-only             */
/* ------------------------------------------------------------------ */

export function RoleBadge({ role }: { role: OrgRole }) {
  const label = role.charAt(0).toUpperCase() + role.slice(1);
  return <span className={`fj-role-badge fj-role-badge--${role}`}>{label}</span>;
}

export function AvailabilityBadge({
  label = "Planned",
}: {
  label?: string;
}) {
  return (
    <span className="fj-avail-badge">
      <BrandIcon name="maintenance" size={12} />
      {label}
    </span>
  );
}
