"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { BrandIcon } from "@/components/design-system/icons";
import { OrgAvatar, RoleBadge } from "./ui";
import { useApp } from "@/lib/app/app-context";
import { switchOrganizationAction } from "@/lib/app/actions/org";
import { useToast } from "./toast";

/**
 * Organization switcher. Shows the active organization, lists accessible ones,
 * supports keyboard navigation and search, and offers creating another. On
 * switch it sets the active-org cookie server-side and refreshes so tenant data
 * reloads cleanly with no stale flash.
 */
export function OrgSwitcher() {
  const { activeOrg, organizations } = useApp();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

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

  const filtered = organizations.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()),
  );

  const onSwitch = async (id: string) => {
    if (id === activeOrg?.id) {
      setOpen(false);
      return;
    }
    setBusy(true);
    const result = await switchOrganizationAction(id);
    setBusy(false);
    if (result.ok) {
      setOpen(false);
      router.push("/app");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  if (!activeOrg) {
    return (
      <Link href="/app/new-organization" className="fj-orgswitcher fj-orgswitcher--empty">
        <OrgAvatar name="New" size={24} />
        <span>Create organization</span>
      </Link>
    );
  }

  return (
    <div className="fj-orgswitcher" ref={rootRef}>
      <button
        type="button"
        className="fj-orgswitcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <OrgAvatar name={activeOrg.name} src={activeOrg.logoUrl} size={24} />
        <span className="fj-orgswitcher__name">{activeOrg.name}</span>
        <BrandIcon name="chevron-down" size={14} />
      </button>

      {open ? (
        <div className="fj-orgswitcher__menu" id={listId} role="listbox" aria-label="Organizations">
          {organizations.length > 6 ? (
            <div className="fj-orgswitcher__search">
              <BrandIcon name="search" size={14} />
              <input
                type="text"
                placeholder="Find an organization"
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Find an organization"
              />
            </div>
          ) : null}

          <div className="fj-orgswitcher__options">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={o.id === activeOrg.id}
                className="fj-orgswitcher__option"
                disabled={busy}
                onClick={() => onSwitch(o.id)}
              >
                <OrgAvatar name={o.name} src={o.logoUrl} size={22} />
                <span className="fj-orgswitcher__option-name">{o.name}</span>
                <RoleBadge role={o.role} />
                {o.id === activeOrg.id ? (
                  <BrandIcon name="check" size={16} />
                ) : null}
              </button>
            ))}
            {filtered.length === 0 ? (
              <p className="fj-orgswitcher__empty">No matches.</p>
            ) : null}
          </div>

          <Link href="/app/new-organization" className="fj-orgswitcher__create">
            <BrandIcon name="plus" size={16} />
            Create organization
          </Link>
        </div>
      ) : null}
    </div>
  );
}
