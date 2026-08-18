import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

/**
 * Answer-engine crawlers (ChatGPT, Claude, Perplexity, Gemini, etc.).
 * Raw markdown mirrors stay crawlable so models can cite them; they send
 * X-Robots-Tag: noindex so they do not compete in Google.
 * Training-only scrapers (Bytespider, CCBot) stay off via Cloudflare.
 */
const ANSWER_ENGINE_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "meta-externalagent",
  "Amazonbot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [...ANSWER_ENGINE_BOTS],
        allow: "/",
        disallow: ["/api/", "/internal/"],
      },
      {
        userAgent: "*",
        allow: "/",
        // Raw /docs|/blog|/compare|/glossary|/tools|/research mirrors are
        // for AI ingestion (X-Robots-Tag: noindex). Do not Disallow them.
        disallow: ["/api/", "/internal/", "/glossary/search"],
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/sitemap-blog.xml`,
      `${siteUrl}/sitemap-glossary.xml`,
      `${siteUrl}/sitemap-comparisons.xml`,
      `${siteUrl}/sitemap-tools.xml`,
      `${siteUrl}/sitemap-research.xml`,
    ],
    host: siteUrl,
  };
}
