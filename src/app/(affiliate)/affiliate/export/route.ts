import { NextResponse } from "next/server";

import { recordAuditEvent } from "@/lib/app/audit";
import { DataFastGoals, trackServerGoal } from "@/lib/analytics";
import { AppAuthError } from "@/lib/auth/errors";
import { requireAffiliatePermission } from "@/lib/affiliates/context";
import { buildAffiliateExport, isExportKind } from "@/lib/affiliates/exports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Affiliate self-service export.
 *
 *   GET /affiliate/export?kind=commissions|statements
 *
 * Requires an affiliate with the export permission. Returns a CSV of the
 * caller's own data only (no customer identity). Records the export and a
 * non-identifying analytics goal.
 */
export async function GET(request: Request) {
  try {
    const { affiliate } = await requireAffiliatePermission("affiliate.export");

    const url = new URL(request.url);
    const kindParam = url.searchParams.get("kind") ?? "commissions";
    if (!isExportKind(kindParam)) {
      return NextResponse.json(
        { error: "Unknown export type." },
        { status: 400 },
      );
    }

    const result = await buildAffiliateExport(affiliate.id, kindParam);

    await recordAuditEvent({
      organizationId: null,
      actorUserId: affiliate.user_id,
      action: "affiliate.export_requested",
      targetType: "affiliate",
      targetId: affiliate.id,
      summary: `Affiliate exported ${kindParam}`,
      metadata: { kind: kindParam, rowCount: result.rowCount },
    });
    await trackServerGoal({ name: DataFastGoals.affiliateExportRequested });

    return new NextResponse(result.csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${result.filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AppAuthError) {
      const status =
        error.kind === "unauthenticated"
          ? 401
          : error.kind === "not_found"
            ? 404
            : 403;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("[affiliates] export failed", error);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
