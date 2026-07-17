import "server-only";

import { cookies } from "next/headers";

export const ACTIVE_ORG_COOKIE = "fajita-active-org";

export async function readActiveOrgId(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_ORG_COOKIE)?.value ?? null;
}

export async function writeActiveOrgId(orgId: string): Promise<void> {
  const store = await cookies();
  store.set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveOrgId(): Promise<void> {
  const store = await cookies();
  store.delete(ACTIVE_ORG_COOKIE);
}
