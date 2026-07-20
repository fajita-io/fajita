import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import type { OrgRole } from "@/lib/auth/roles";
import { dispatchFeedbackClose, dispatchFeedbackOpen } from "@/lib/genius/feedback-events";
import { geniusContextForRoute } from "@/lib/genius/route-context";
import type {
  GeniusCategory,
  GeniusProductContext,
} from "@/lib/genius/types";

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export type GeniusOpenSource =
  | "floating"
  | "sidebar"
  | "command_palette"
  | "account_menu"
  | "inline"
  | "button"
  | "support_page";

export interface GeniusIdentityInput {
  userId: string;
  email: string | null;
  displayName: string;
  orgRole: OrgRole | null;
  planLabel: string;
}

export interface GeniusAccountInput {
  organizationId: string;
  organizationName: string;
  planLabel: string;
}

export function formatGeniusRole(role: OrgRole | null): string | undefined {
  if (!role) return undefined;
  return ROLE_LABELS[role];
}

export function syncGeniusIdentity(input: GeniusIdentityInput): void {
  window.Genius?.identify({
    id: input.userId,
    ...(input.email ? { email: input.email } : {}),
    name: input.displayName,
    plan: input.planLabel,
    ...(input.orgRole ? { role: formatGeniusRole(input.orgRole) } : {}),
  });
}

export function syncGeniusAccount(input: GeniusAccountInput): void {
  window.Genius?.setAccount({
    id: input.organizationId,
    name: input.organizationName,
    plan: input.planLabel,
  });
}

export function syncGeniusRouteContext(
  pathname: string,
  extra?: Partial<GeniusProductContext>,
): void {
  window.Genius?.setContext({
    ...geniusContextForRoute(pathname),
    ...extra,
  });
}

export function resetGenius(): void {
  window.Genius?.reset();
}

export function openGeniusFeedback(options?: {
  source: GeniusOpenSource;
  category?: GeniusCategory;
  pathname?: string;
  context?: Partial<GeniusProductContext>;
  /** When false, caller already tracked the open (e.g. data-genius-open capture). */
  track?: boolean;
}): void {
  const pathname =
    options?.pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/app");

  if (options?.track !== false) {
    trackGoal(DataFastGoals.geniusOpened, {
      source: options?.source ?? "button",
      ...(options?.category ? { category: options.category } : {}),
    });
  }

  dispatchFeedbackOpen({
    source: options?.source ?? "button",
    ...(options?.category ? { category: options.category } : {}),
    context: {
      ...geniusContextForRoute(pathname),
      ...options?.context,
    },
  });
}

export function closeGeniusFeedback(source = "programmatic"): void {
  trackGoal(DataFastGoals.geniusClosed, { source });
  dispatchFeedbackClose();
}

export function bindGeniusSubmitHandler(): () => void {
  const previous = window.Genius?.onSubmit;

  if (window.Genius) {
    window.Genius.onSubmit = (item) => {
      trackGoal(DataFastGoals.geniusSubmitted, { category: item.category });
      previous?.(item);
    };
  }

  return () => {
    if (window.Genius) {
      window.Genius.onSubmit = previous;
    }
  };
}
