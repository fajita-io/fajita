"use client";

import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandIcon } from "@/components/design-system/icons";
import { FajitaMark } from "@/components/brand/logo/fajita-mark";
import { Avatar } from "./ui";
import { useApp } from "@/lib/app/app-context";
import { resetGenius } from "@/lib/genius/client";
import { useTheme } from "@/lib/theme/use-theme";

/**
 * Account menu: identity summary, quick links to profile/security/preferences,
 * a theme toggle, and sign out. Closes on Escape and outside click.
 */
export function AccountMenu() {
  const { profile } = useApp();
  const { signOut } = useClerk();
  const router = useRouter();
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cycleTheme = () => {
    const next =
      preference === "light" ? "dark" : preference === "dark" ? "system" : "light";
    setPreference(next);
  };

  return (
    <div className="fj-accountmenu" ref={rootRef}>
      <button
        type="button"
        className="fj-accountmenu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar name={profile.displayName} src={profile.avatarUrl} size={30} />
      </button>

      {open ? (
        <div className="fj-accountmenu__menu" role="menu">
          <div className="fj-accountmenu__identity">
            <Avatar name={profile.displayName} src={profile.avatarUrl} size={36} />
            <div>
              <p className="fj-accountmenu__name">{profile.displayName}</p>
              {profile.email ? (
                <p className="fj-accountmenu__email">{profile.email}</p>
              ) : null}
            </div>
          </div>

          <div className="fj-accountmenu__group" role="none">
            <Link href="/app/settings/profile" role="menuitem" className="fj-menu-item">
              <BrandIcon name="settings" size={16} /> Profile settings
            </Link>
            <Link href="/app/settings/security" role="menuitem" className="fj-menu-item">
              <BrandIcon name="shield" size={16} /> Security
            </Link>
            <Link href="/app/settings/preferences" role="menuitem" className="fj-menu-item">
              <BrandIcon name="palette" size={16} /> Preferences
            </Link>
            <button
              type="button"
              role="menuitem"
              className="fj-menu-item"
              onClick={cycleTheme}
            >
              <BrandIcon name="palette" size={16} /> Theme: {preference}
            </button>
          </div>

          <div className="fj-accountmenu__group" role="none">
            <button
              type="button"
              role="menuitem"
              className="fj-menu-item"
              data-genius-open
              data-genius-source="account_menu"
              onClick={() => setOpen(false)}
            >
              <span className="fj-sidenav__icon" aria-hidden="true">
                <FajitaMark size={16} label="" tone="auto" />
              </span>
              Share feedback
            </button>
            <button
              type="button"
              role="menuitem"
              className="fj-menu-item fj-menu-item--danger"
              onClick={() => {
                setOpen(false);
                resetGenius();
                signOut(() => router.push("/"));
              }}
            >
              <BrandIcon name="logout" size={16} /> Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
