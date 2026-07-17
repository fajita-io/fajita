import { DOC_CATEGORY_META, MODEL_ORDER, MODEL_LABELS } from "@/lib/docs/categories";
import { DOCS_VERSION } from "@/lib/docs/frontmatter";
import { buildNavigation, llmDocs } from "@/lib/docs/registry";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

/**
 * AI-readable index of the documentation. Concise: product summary, the four
 * mental models, and a link to every public page. Excludes drafts, internal
 * pages, and anything marked not for LLM inclusion.
 */
export function GET() {
  const nav = buildNavigation();
  const count = llmDocs().length;

  const lines: string[] = [
    "# Fajita documentation",
    "",
    "Fajita is uptime-monitoring software. It watches websites, APIs, SSL certificates, and cron jobs (heartbeats), confirms a failure before alerting, routes alerts to email, Slack, Discord, and signed webhooks, and publishes public status pages.",
    "",
    "This file indexes the public documentation. Full page text is at " +
      `${siteUrl}/docs/llms-full.txt. Each page also has a plain-text form at ${siteUrl}/docs/raw/<slug>.`,
    "",
    `Docs version: ${DOCS_VERSION}`,
    `Pages: ${count}`,
    `Last updated: ${DOCS_VERSION}`,
    "",
    "## How monitoring works",
    "",
    "- A monitor runs scheduled checks on an interval (1 minute to 1 hour).",
    "- A failed check is retried; retries decide transience.",
    "- Verification counts consecutive failures against a threshold before an incident opens.",
    "- Recovery is confirmed before an incident resolves.",
    "- Manual tests never open incidents.",
    "",
    "## Security guidance",
    "",
    "- Monitors and webhooks can only reach public destinations; private and reserved networks are blocked.",
    "- Generic webhooks are signed with HMAC-SHA256; verify over the raw request body.",
    "- Never place secrets in monitor names, public component names, or status updates.",
    "",
    "## Documentation index",
    "",
  ];

  for (const model of MODEL_ORDER) {
    const group = nav.find((n) => n.model === model);
    if (!group) continue;
    lines.push(`### ${MODEL_LABELS[model]}`, "");
    for (const cat of group.categories) {
      lines.push(`${DOC_CATEGORY_META[cat.id].label}:`);
      for (const link of cat.links) {
        if (link.deprecated) continue;
        lines.push(`- ${link.title}: ${siteUrl}/docs/${link.slug}`);
      }
      lines.push("");
    }
  }

  lines.push(
    "## Company",
    "",
    "Fajita",
    "1001 S Main St, Ste 600",
    "Kalispell, MT 59901",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
