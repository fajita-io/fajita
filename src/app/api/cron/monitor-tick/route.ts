import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env";
import { runMonitorCronTick } from "@/lib/monitoring/vercel-worker/run-tick";
import { refreshSnapshot } from "@/lib/status-pages/projection";
import { getStatusPageBySlug } from "@/lib/status-pages/status-pages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const expected = serverEnv().CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

/**
 * Scheduled monitor execution (Vercel Cron).
 * Leases due checks, executes HTTP monitors, finalizes results, evaluates incidents.
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const monitors = await runMonitorCronTick();

    const slug = process.env.FAJITA_SERVICE_STATUS_SLUG?.trim();
    if (slug) {
      const page = await getStatusPageBySlug(slug);
      if (page?.status === "published") {
        await refreshSnapshot(page.organizationId, page.id);
      }
    }

    return NextResponse.json({ ok: true, monitors });
  } catch (error) {
    console.error("[cron] monitor tick failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "monitor tick failed",
      },
      { status: 500 },
    );
  }
}
