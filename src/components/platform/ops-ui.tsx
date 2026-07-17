import Link from "next/link";
import type { ReactNode } from "react";

import type { DataCompleteness } from "@/lib/platform/metrics/definitions";
import type { PlatformState } from "@/lib/platform/command-center/load";

export function OpsPageHeader({
  title,
  deck,
  actions,
}: {
  title: string;
  deck?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="fj-ops-page-header">
      <div>
        <h1 className="fj-ops-page-title">{title}</h1>
        {deck ? <p className="fj-ops-page-deck">{deck}</p> : null}
      </div>
      {actions ? (
        <div className="fj-ops-page-header__actions">{actions}</div>
      ) : null}
    </header>
  );
}

export function OpsMetricCard({
  label,
  value,
  completeness,
  meta,
}: {
  label: string;
  value: string | number | null;
  completeness: DataCompleteness;
  meta?: string;
}) {
  const unavailable = completeness === "unavailable" || value === null;
  return (
    <div className="fj-ops-card">
      <div className="fj-ops-card__label">{label}</div>
      <div className="fj-ops-card__value">
        {unavailable ? "—" : value}
      </div>
      <div className="fj-ops-card__meta">
        <span className={`fj-ops-completeness fj-ops-completeness--${completeness}`}>
          {completeness}
        </span>
        {meta ? ` · ${meta}` : null}
      </div>
    </div>
  );
}

export function OpsStatus({ state }: { state: PlatformState | string }) {
  return (
    <span className={`fj-ops-status fj-ops-status--${state}`}>
      {state.replaceAll("_", " ")}
    </span>
  );
}

export function OpsPanel({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="fj-ops-panel">
      <div className="fj-ops-panel__head">
        <h2>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function OpsEmpty({ children }: { children: ReactNode }) {
  return <p className="fj-ops-empty">{children}</p>;
}

export function OpsLinkButton({
  href,
  children,
  primary,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`fj-ops-btn${primary ? " fj-ops-btn--primary" : ""}`}
    >
      {children}
    </Link>
  );
}

export function OpsBreadcrumbs({
  items,
}: {
  items: Array<{ href?: string; label: string }>;
}) {
  return (
    <nav className="fj-ops__crumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 ? " / " : null}
          {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
        </span>
      ))}
    </nav>
  );
}

/** Horizontal scroll wrapper for wide ops tables (mobile-safe). */
export function OpsTable({ children }: { children: ReactNode }) {
  return <div className="fj-ops-table-wrap">{children}</div>;
}
