"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandIcon, type BrandIconName } from "@/components/design-system/icons";
import { useApp } from "@/lib/app/app-context";
import { buildNav, isPlannedItem } from "@/lib/app/nav-model";
import { useTheme } from "@/lib/theme/use-theme";
import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import { openGeniusFeedback, resetGenius } from "@/lib/genius/client";
import { switchOrganizationAction } from "@/lib/app/actions/org";

interface Command {
  id: string;
  label: string;
  group: string;
  icon: BrandIconName;
  run: () => void;
  keywords?: string;
}

/**
 * Command palette. Cmd/Ctrl+K opens it anywhere in the app. Accessible
 * combobox: type to filter, arrows to move, Enter to run, Escape to close.
 * Only offers commands the caller can actually use (permission- and
 * feature-aware). No commands for unbuilt features; no hidden destructive
 * actions (sign out is explicit and labeled).
 */
export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const app = useApp();
  const router = useRouter();
  const { signOut } = useClerk();
  const { preference, setPreference } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      onClose();
      router.push(href);
    };
    const nav = buildNav({
      features: app.features,
      permissions: app.permissions,
      isPlatformAdmin: app.isPlatformAdmin,
    })
      .flatMap((g) => g.items)
      .filter((i) => !isPlannedItem(i, app.features) && !i.external)
      .map<Command>((i) => ({
        id: `nav:${i.href}`,
        label: `Go to ${i.label}`,
        group: "Navigate",
        icon: i.icon,
        run: go(i.href),
      }));

    const orgCommands: Command[] = app.organizations
      .filter((o) => o.id !== app.activeOrg?.id)
      .slice(0, 8)
      .map((o) => ({
        id: `org:${o.id}`,
        label: `Switch to ${o.name}`,
        group: "Organizations",
        icon: "building",
        run: async () => {
          onClose();
          const res = await switchOrganizationAction(o.id);
          if (res.ok) {
            router.push("/app");
            router.refresh();
          }
        },
      }));

    const actions: Command[] = [
      {
        id: "action:theme",
        label: `Toggle theme (now: ${preference})`,
        group: "Actions",
        icon: "palette",
        run: () => {
          setPreference(
            preference === "light" ? "dark" : preference === "dark" ? "system" : "light",
          );
          trackGoal(DataFastGoals.themeChanged);
        },
      },
      {
        id: "action:feedback",
        label: "Share product feedback",
        group: "Actions",
        icon: "support",
        keywords: "idea feature request bug praise genius",
        run: () => {
          onClose();
          openGeniusFeedback({ source: "command_palette" });
        },
      },
      {
        id: "action:support",
        label: "Open support",
        group: "Actions",
        icon: "support",
        run: go("/app/support"),
      },
      {
        id: "action:status",
        label: "View service status",
        group: "Actions",
        icon: "status-page",
        run: () => {
          onClose();
          window.open("/status", "_blank", "noreferrer");
        },
      },
      {
        id: "action:signout",
        label: "Sign out",
        group: "Actions",
        icon: "logout",
        run: () => {
          onClose();
          resetGenius();
          void signOut(() => router.push("/"));
        },
      },
    ];

    const incidentCommands: Command[] = [];
    if (app.features.incidents) {
      incidentCommands.push({
        id: "inc:active",
        label: "View active incidents",
        group: "Incidents",
        icon: "incident",
        run: go("/app/incidents"),
      });
      if (app.permissions.includes("incidents:manage")) {
        incidentCommands.push({
          id: "inc:new",
          label: "Create manual incident",
          group: "Incidents",
          icon: "plus",
          keywords: "open outage report",
          run: go("/app/incidents/new"),
        });
      }
    }
    if (app.features.maintenance && app.permissions.includes("maintenance:manage")) {
      incidentCommands.push({
        id: "mw:new",
        label: "Schedule maintenance",
        group: "Maintenance",
        icon: "maintenance",
        keywords: "window planned downtime",
        run: go("/app/maintenance/new"),
      });
    }

    const statusPageCommands: Command[] = [];
    if (app.features.statusPages || app.isPlatformAdmin) {
      statusPageCommands.push({
        id: "sp:list",
        label: "Open status pages",
        group: "Status Pages",
        icon: "status-page",
        run: go("/app/status-pages"),
      });
      if (app.permissions.includes("status_pages:manage")) {
        statusPageCommands.push({
          id: "sp:new",
          label: "Create status page",
          group: "Status Pages",
          icon: "plus",
          keywords: "public status subdomain",
          run: go("/app/status-pages/new"),
        });
      }
    }

    return [...nav, ...orgCommands, ...incidentCommands, ...statusPageCommands, ...actions];
  }, [app, router, onClose, preference, setPreference, signOut]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.keywords?.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      trackGoal(DataFastGoals.commandPaletteOpened);
      const id = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(id);
    }
    setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  return (
    <div className="fj-cmdk__backdrop">
      <div
        ref={panelRef}
        className="fj-cmdk"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="fj-cmdk__input">
          <BrandIcon name="search" size={18} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="fj-cmdk-list"
            aria-activedescendant={filtered[active] ? `cmd-${filtered[active].id}` : undefined}
            placeholder="Search commands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="fj-cmdk__kbd">Esc</kbd>
        </div>
        <ul className="fj-cmdk__list" id="fj-cmdk-list" role="listbox">
          {filtered.map((c, i) => (
            <li
              key={c.id}
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={i === active}
              className="fj-cmdk__item"
              data-active={i === active || undefined}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                c.run();
              }}
            >
              <BrandIcon name={c.icon} size={16} />
              <span>{c.label}</span>
              <span className="fj-cmdk__group">{c.group}</span>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="fj-cmdk__empty">No commands match &ldquo;{query}&rdquo;.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
