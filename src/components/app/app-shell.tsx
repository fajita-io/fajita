"use client";

import { useEffect, useState, type ReactNode } from "react";

import { GeniusMount } from "@/components/genius/genius-mount";
import { AskFajitaMount } from "@/components/support/ask-fajita-mount";
import { AppProvider, type AppContextValue } from "@/lib/app/app-context";
import { ToastProvider } from "./toast";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";

const COLLAPSE_KEY = "fajita-sidebar-collapsed";

/**
 * The authenticated application shell. Composes the sidebar, top utility bar,
 * mobile navigation, command palette, and global toast area around the routed
 * content. State (collapse, palette, mobile sheet) lives here; everything below
 * reads the app context.
 */
export function AppShell({
  context,
  children,
}: {
  context: AppContextValue;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore sidebar preference (client-only; no server round trip).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Global command-palette shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AppProvider value={context}>
      <ToastProvider>
        <div className="fj-app" data-collapsed={collapsed || undefined}>
          <Sidebar collapsed={collapsed} onToggle={toggleCollapse} />
          <div className="fj-app__main">
            <Topbar
              onOpenCommand={() => setPaletteOpen(true)}
              onOpenMobileNav={() => setMobileOpen(true)}
            />
            <main id="main" className="fj-app__content">
              {children}
            </main>
          </div>
        </div>
        <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <GeniusMount />
        {context.features.pamphletSupport ? (
          <AskFajitaMount
            mode="authenticated"
            pageContext={{ route: "/app", productArea: "application" }}
          />
        ) : null}
      </ToastProvider>
    </AppProvider>
  );
}
