import { NextResponse } from "next/server";

import { getGitHubStarCount } from "@/lib/site/github-stars";
import { ossGitHubVisible } from "@/lib/site/oss-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Live GitHub star count for the header widget. */
export async function GET() {
  if (!ossGitHubVisible()) {
    return NextResponse.json({ count: null }, { status: 404 });
  }

  const count = await getGitHubStarCount();

  return NextResponse.json(
    { count },
    {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
