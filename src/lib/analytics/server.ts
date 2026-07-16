import "server-only";

import {
  DATAFAST_SESSION_COOKIE,
  DATAFAST_VISITOR_COOKIE,
  datafastConfig,
} from "@/lib/analytics/config";
import {
  type DataFastGoalName,
  sanitizeGoalParams,
} from "@/lib/analytics/goals";
import { cookies } from "next/headers";

const GOALS_API_URL = "https://datafa.st/api/v1/goals";

type TrackGoalOptions = {
  name: DataFastGoalName | string;
  visitorId?: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Read DataFast visitor/session cookies for Stripe revenue attribution.
 * Pass the result as Stripe Checkout metadata.
 */
export async function getDataFastAttributionCookies(): Promise<{
  datafast_visitor_id?: string;
  datafast_session_id?: string;
}> {
  const cookieStore = await cookies();

  const visitorId = cookieStore.get(DATAFAST_VISITOR_COOKIE)?.value;
  const sessionId = cookieStore.get(DATAFAST_SESSION_COOKIE)?.value;

  return {
    ...(visitorId ? { datafast_visitor_id: visitorId } : {}),
    ...(sessionId ? { datafast_session_id: sessionId } : {}),
  };
}

/**
 * Server-side goal tracking via DataFast API (most accurate).
 * Requires DATAFAST_API_KEY (df_ website key from Website Settings > API).
 */
export async function trackGoal({
  name,
  visitorId,
  description,
  metadata,
}: TrackGoalOptions): Promise<{ ok: boolean; eventId?: string }> {
  const apiKey = process.env.DATAFAST_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[datafast] DATAFAST_API_KEY missing; goal not sent:", name);
    }
    return { ok: false };
  }

  const resolvedVisitorId =
    visitorId ?? (await getDataFastAttributionCookies()).datafast_visitor_id;

  if (!resolvedVisitorId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[datafast] No visitor cookie; goal not sent:", name);
    }
    return { ok: false };
  }

  const sanitizedMetadata = sanitizeGoalParams(metadata);

  const body: Record<string, unknown> = {
    datafast_visitor_id: resolvedVisitorId,
    name,
  };

  if (description) body.description = description;
  if (sanitizedMetadata) body.metadata = sanitizedMetadata;

  const websiteId = datafastConfig.websiteId;
  const url = websiteId.startsWith("dfid_")
    ? `${GOALS_API_URL}?websiteId=${encodeURIComponent(websiteId)}`
    : GOALS_API_URL;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[datafast] Goal API error:", response.status, name);
      }
      return { ok: false };
    }

    const payload = (await response.json()) as {
      data?: Array<{ eventId?: string }>;
    };

    return { ok: true, eventId: payload.data?.[0]?.eventId };
  } catch {
    return { ok: false };
  }
}
