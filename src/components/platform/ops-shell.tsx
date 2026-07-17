"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  COMMAND_PALETTE_ITEMS,
  INTERNAL_NAV,
} from "@/lib/platform/navigation";
import type { PlatformPermission } from "@/lib/platform/permissions";

export interface OpsShellProps {
  operatorName: string;
  operatorRole: string;
  environment: string;
  version: string;
  approvalCount: number;
  activeIncidents: number;
  providerState: string;
  permissions: string[];
  children: React.ReactNode;
}

export function OpsShell({
  operatorName,
  operatorRole,
  environment,
  version,
  approvalCount,
  activeIncidents,
  providerState,
  permissions,
  children,
}: OpsShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const permSet = useMemo(() => new Set(permissions), [permissions]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const paletteTitleId = useId();

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (paletteOpen && !el.open) el.showModal();
    if (!paletteOpen && el.open) el.close();
  }, [paletteOpen]);

  const commands = COMMAND_PALETTE_ITEMS.filter((item) => {
    if (item.permission && !permSet.has(item.permission)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
    );
  });

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/internal/customers?q=${encodeURIComponent(q)}`);
    setPaletteOpen(false);
  }

  return (
    <div className="fj-ops">
      <aside className="fj-ops__sidebar" aria-label="Internal navigation">
        <div className="fj-ops__brand">
          <span className="fj-ops__brand-name">Fajita Ops</span>
          <span className="fj-ops__env">
            {environment} · {version}
          </span>
        </div>

        <button
          type="button"
          className="fj-ops-btn"
          style={{ marginBottom: 12, width: "100%", justifyContent: "center" }}
          onClick={() => setNavOpen((v) => !v)}
          aria-expanded={navOpen}
        >
          {navOpen ? "Hide navigation" : "Show navigation"}
        </button>

        <nav className={navOpen ? "fj-ops-nav-open" : "fj-ops-nav-desktop"}>
          <style>{`
            @media (min-width: 1025px) {
              .fj-ops-nav-desktop { display: block !important; }
            }
            @media (max-width: 1024px) {
              .fj-ops-nav-desktop { display: none; }
              .fj-ops-nav-open { display: block; }
            }
          `}</style>
          {INTERNAL_NAV.map((section) => (
            <div key={section.id} className="fj-ops__nav-section">
              <div className="fj-ops__nav-label">{section.label}</div>
              {section.items
                .filter(
                  (item) =>
                    !item.permission ||
                    permSet.has(item.permission as PlatformPermission) ||
                    permSet.size === 0,
                )
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="fj-ops__nav-link"
                    aria-current={
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "page"
                        : undefined
                    }
                  >
                    {item.label}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="fj-ops__main">
        <header className="fj-ops__topbar">
          <form className="fj-ops-search" onSubmit={onSearchSubmit} role="search">
            <label className="visually-hidden" htmlFor="ops-search">
              Search organizations
            </label>
            <input
              id="ops-search"
              name="q"
              placeholder="Search orgs… (⌘K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setPaletteOpen(true)}
              autoComplete="off"
            />
          </form>
          <div className="fj-ops__meta">
            <span>{operatorName}</span>
            <span aria-hidden>·</span>
            <span>{operatorRole}</span>
            <span aria-hidden>·</span>
            <Link href="/internal/approvals">
              Approvals {approvalCount}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/internal/operations/incidents">
              Incidents {activeIncidents}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/internal/providers">Providers {providerState}</Link>
            <span aria-hidden>·</span>
            <Link href="/app">Exit to app</Link>
          </div>
        </header>
        <div className="fj-ops__content">{children}</div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={paletteTitleId}
        onClose={() => setPaletteOpen(false)}
        style={{
          border: "1px solid var(--ops-border)",
          borderRadius: 8,
          background: "var(--ops-surface)",
          color: "var(--ops-text)",
          padding: 0,
          width: "min(520px, 92vw)",
        }}
      >
        <form method="dialog" style={{ padding: 16 }} onSubmit={onSearchSubmit}>
          <h2 id={paletteTitleId} style={{ margin: "0 0 8px", fontSize: "1rem" }}>
            Command palette
          </h2>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to…"
            style={{
              width: "100%",
              marginBottom: 12,
              padding: "8px 10px",
              background: "var(--ops-bg)",
              border: "1px solid var(--ops-border)",
              color: "inherit",
              borderRadius: 4,
            }}
          />
          <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 320, overflow: "auto" }}>
            {commands.map((cmd) => (
              <li key={cmd.id}>
                <button
                  type="button"
                  className="fj-ops-btn"
                  style={{ width: "100%", justifyContent: "flex-start", marginBottom: 4 }}
                  onClick={() => {
                    setPaletteOpen(false);
                    router.push(cmd.href);
                  }}
                >
                  {cmd.label}
                </button>
              </li>
            ))}
            {commands.length === 0 ? (
              <li className="fj-ops-empty">No matching commands.</li>
            ) : null}
          </ul>
          <p style={{ fontSize: "0.75rem", color: "var(--ops-muted)", marginTop: 12 }}>
            Sensitive actions open a review screen. Nothing destructive runs from here.
          </p>
        </form>
      </dialog>
    </div>
  );
}
