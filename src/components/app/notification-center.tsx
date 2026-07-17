"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandIcon } from "@/components/design-system/icons";
import { EmptyState } from "./ui";
import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem,
} from "@/lib/app/actions/notifications";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/**
 * In-app notification center. Loads on open (cursor-limited), supports mark one
 * / mark all read, deep links, and an accessible empty state. Renders text
 * only, never arbitrary HTML. Announces its state politely.
 */
export function NotificationCenter({ initialUnread }: { initialUnread: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    const res = await listNotificationsAction();
    setLoading(false);
    if (res.ok && res.data) {
      setItems(res.data.items);
      setUnread(res.data.unread);
    }
  };

  useEffect(() => {
    if (!open) return;
    void load();
    trackGoal(DataFastGoals.notificationOpened);
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

  const onItem = async (n: NotificationItem) => {
    if (!n.readAt) {
      await markNotificationReadAction(n.id);
      setItems((list) =>
        list.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)),
      );
      setUnread((u) => Math.max(0, u - 1));
    }
    if (n.href) {
      setOpen(false);
      router.push(n.href);
    }
  };

  const markAll = async () => {
    await markAllNotificationsReadAction();
    setItems((list) => list.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })));
    setUnread(0);
  };

  return (
    <div className="fj-notif" ref={rootRef}>
      <button
        type="button"
        className="fj-icon-button fj-notif__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        onClick={() => setOpen((o) => !o)}
      >
        <BrandIcon name="bell" size={18} />
        {unread > 0 ? (
          <span className="fj-notif__dot" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fj-notif__panel" role="dialog" aria-label="Notifications">
          <div className="fj-notif__head">
            <h2 className="fj-notif__title">Notifications</h2>
            {unread > 0 ? (
              <button type="button" className="fj-link-button" onClick={markAll}>
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="fj-notif__body" aria-live="polite">
            {loading ? (
              <p className="fj-notif__loading">Loading…</p>
            ) : items.length === 0 ? (
              <EmptyState
                icon="bell"
                title="Nothing here yet"
                description="Invitations, role changes, and account activity will show up here."
              />
            ) : (
              <ul className="fj-notif__list">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="fj-notif__item"
                      data-unread={!n.readAt || undefined}
                      onClick={() => onItem(n)}
                    >
                      <span className="fj-notif__item-title">{n.title}</span>
                      {n.body ? (
                        <span className="fj-notif__item-body">{n.body}</span>
                      ) : null}
                      <span className="fj-notif__item-time">{timeAgo(n.createdAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
