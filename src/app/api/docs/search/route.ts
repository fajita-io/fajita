import { redactQuery, searchDocs } from "@/lib/docs/search";
import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal as trackServerGoal } from "@/lib/analytics/server";

/**
 * Documentation search endpoint. Ranking runs server-side so no corpus ships
 * in the client bundle. The query is scrubbed before any analytics event, so
 * secrets or personal data in a query are never stored or forwarded.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const results = searchDocs(q);

  // Aggregate, sanitized analytics only. Never the raw query.
  const safe = redactQuery(q);
  await trackServerGoal({
    name: results.length === 0 ? DataFastGoals.docsSearchNoResult : DataFastGoals.docsSearchSubmitted,
    metadata: { q: safe, results: String(results.length) },
  }).catch(() => {});

  return Response.json(
    { results },
    { headers: { "Cache-Control": "no-store" } },
  );
}
