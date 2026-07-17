"use server";

import { requireAuthenticatedUser } from "@/lib/auth/context";
import { serviceClient } from "@/lib/supabase/service";
import { toActionError, type ActionResult } from "./shared";

export interface NotificationItem {
  id: string;
  category: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function listNotificationsAction(): Promise<
  ActionResult<{ items: NotificationItem[]; unread: number }>
> {
  try {
    const profile = await requireAuthenticatedUser();
    const db = serviceClient();
    const { data, error } = await db
      .from("notifications")
      .select("id, category, title, body, href, read_at, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw error;

    const items = (data ?? []).map((n) => ({
      id: n.id,
      category: n.category,
      title: n.title,
      body: n.body,
      href: n.href,
      readAt: n.read_at,
      createdAt: n.created_at,
    }));
    const unread = items.filter((n) => !n.readAt).length;
    return { ok: true, data: { items, unread } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function markNotificationReadAction(
  id: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    const db = serviceClient();
    const { error } = await db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", profile.id)
      .is("read_at", null);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const profile = await requireAuthenticatedUser();
    const db = serviceClient();
    const { error } = await db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", profile.id)
      .is("read_at", null);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
