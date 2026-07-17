import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import {
  rebuildPlatformDailyHealth,
  snapshotOrganizationHealth,
} from "@/lib/platform/jobs/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function tokenOk(header: string | null): boolean {
  const expected = process.env.PLATFORM_ANALYTICS_WORKER_TOKEN;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${expected}`);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Bearer-token worker trigger for platform analytics jobs.
 * Unset token → 404 (fail closed / disabled).
 */
export async function POST(request: Request) {
  if (!process.env.PLATFORM_ANALYTICS_WORKER_TOKEN) {
    return new NextResponse(null, { status: 404 });
  }
  if (!tokenOk(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    job?: string;
    limit?: number;
  };

  switch (body.job) {
    case "daily_health": {
      const result = await rebuildPlatformDailyHealth();
      return NextResponse.json(result);
    }
    case "org_health": {
      const result = await snapshotOrganizationHealth(
        Math.min(body.limit ?? 100, 500),
      );
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json(
        { error: "unknown_job", jobs: ["daily_health", "org_health"] },
        { status: 400 },
      );
  }
}
