"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { FeatureKey, FeatureMap } from "./feature-flags";
import type { OrgRole, Permission } from "@/lib/auth/roles";

export interface AppProfile {
  id: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
}

export interface AppOrg {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
  logoUrl: string | null;
}

export interface AppContextValue {
  profile: AppProfile;
  activeOrg: AppOrg | null;
  organizations: AppOrg[];
  permissions: Permission[];
  isPlatformAdmin: boolean;
  features: FeatureMap;
  unreadNotifications: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  value,
  children,
}: {
  value: AppContextValue;
  children: ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/** UI-only capability check. Server actions re-check; this just hides controls. */
export function useCan(permission: Permission): boolean {
  const { permissions } = useApp();
  return permissions.includes(permission);
}

export function useFeature(key: FeatureKey): boolean {
  const { features } = useApp();
  return features[key];
}
