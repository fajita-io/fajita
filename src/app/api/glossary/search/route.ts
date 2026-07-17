import { NextResponse } from "next/server";

import { GLOSSARY_VERSION } from "@/lib/glossary/frontmatter";
import { recordGlossaryNoResult } from "@/lib/glossary/feedback";
import { redactQuery, searchGlossary } from "@/lib/glossary/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const results = searchGlossary(q, { category, limit: 12 });

  if (q.trim().length >= 2 && results.length === 0) {
    try {
      await recordGlossaryNoResult(redactQuery(q), GLOSSARY_VERSION);
    } catch {
      /* persistence is best-effort */
    }
  }

  return NextResponse.json({
    results,
    redactedQueryLength: redactQuery(q).length,
  });
}
