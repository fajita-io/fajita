import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import {
  baseFeatureMap,
  FEATURE_REGISTRY,
  isStageAvailable,
  type FeatureKey,
  type FeatureMap,
} from "./feature-flags";

/**
 * Resolve the feature map for an organization: code stage first, then any
 * org-scoped overrides from feature_flag_overrides. Overrides are audited at
 * write time (admin surface, later phase); reads here are cheap and cached per
 * request by the caller.
 */
export async function resolveFeatureMap(
  organizationId: string | null,
): Promise<FeatureMap> {
  const map = baseFeatureMap();
  if (!organizationId) return map;

  const db = serviceClient();
  const { data } = await db
    .from("feature_flag_overrides")
    .select("flag_key, enabled")
    .eq("organization_id", organizationId);

  for (const row of data ?? []) {
    if ((FEATURE_REGISTRY as Record<string, unknown>)[row.flag_key]) {
      map[row.flag_key as FeatureKey] = row.enabled;
    }
  }
  return map;
}

/** Server guard: throw-free check whether a feature is on for an org. */
export async function isFeatureEnabled(
  key: FeatureKey,
  organizationId: string | null,
): Promise<boolean> {
  if (organizationId) {
    const map = await resolveFeatureMap(organizationId);
    return map[key];
  }
  return isStageAvailable(FEATURE_REGISTRY[key].stage);
}
