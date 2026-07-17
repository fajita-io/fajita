import { overallToBadgeStatus } from "@/lib/status-pages/public-state";
import { getPublicSnapshotBySlug } from "@/lib/status-pages/projection";
import { clientKey, rateLimit } from "@/lib/site/rate-limit";

/**
 * Embeddable SVG status badge. No JavaScript, no tracking, cacheable, and
 * rate-limited so it cannot be used as an image proxy. Renders the current
 * overall state with an accessible title.
 */
export const revalidate = 30;

const BADGE_COLOR: Record<string, string> = {
  operational: "#3f7d2e",
  degraded: "#9a6b00",
  maintenance: "#2b5b8c",
  down: "#b42318",
};

const BADGE_LABEL: Record<string, string> = {
  operational: "operational",
  degraded: "degraded",
  maintenance: "maintenance",
  major_outage: "major outage",
  partial_outage: "partial outage",
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!rateLimit(`status_badge:${clientKey(request)}`, { limit: 120, windowMs: 60_000 })) {
    return new Response("rate limited", { status: 429 });
  }

  const { slug } = await params;
  const snapshot = await getPublicSnapshotBySlug(slug);

  const label = "status";
  const value =
    snapshot && snapshot.visibility === "public"
      ? BADGE_LABEL[snapshot.overallStatus] ?? "unknown"
      : "unknown";
  const badge = snapshot ? overallToBadgeStatus(snapshot.overallStatus) : "degraded";
  const color = BADGE_COLOR[badge] ?? "#6b6862";

  const labelW = 52;
  const valueW = Math.max(70, value.length * 7 + 20);
  const total = labelW + valueW;
  const title = `${label}: ${value}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${escapeXml(title)}">
  <title>${escapeXml(title)}</title>
  <rect width="${total}" height="20" rx="3" fill="#24211d"/>
  <rect x="${labelW}" width="${valueW}" height="20" rx="3" fill="${color}"/>
  <rect x="${labelW}" width="4" height="20" fill="${color}"/>
  <g fill="#fff" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="8" y="14">${escapeXml(label)}</text>
    <text x="${labelW + 8}" y="14">${escapeXml(value)}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
