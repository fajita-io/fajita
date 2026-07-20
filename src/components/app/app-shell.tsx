"use client";

import { useEffect, useState, type ReactNode } from "react";

import { GeniusMount } from "@/components/genius/genius-mount";
import { AppProvider, type AppContextValue } from "@/lib/app/app-context";
import { ToastProvider } from "./toast";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";

import {
  SIDEBAR_COLLAPSE_KEY,
  setSidebarCollapsedDataset,
} from "@/lib/app/sidebar-script";

/**
 * The authenticated application shell. Composes the sidebar, top utility bar,
 * mobile navigation, command palette, and global toast area around the routed
 * content. State (collapse and command palette) lives here; everything below
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

  // Restore sidebar preference (client-only; no server round trip).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1";
      setCollapsed(stored);
      setSidebarCollapsedDataset(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      setSidebarCollapsedDataset(next);
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
            <Topbar onOpenCommand={() => setPaletteOpen(true)} />
            <main id="main" className="fj-app__content">
              {children}
            </main>
          </div>
        </div>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <GeniusMount />
      </ToastProvider>
    </AppProvider>
  );
}
