const ALLOWED_PREFIXES = [
  "/docs",
  "/glossary",
  "/pricing",
  "/blog",
  "/compare",
  "/tools",
  "/research",
  "/support",
  "/contact",
  "/security",
  "/status",
  "/affiliates",
  "/affiliate",
  "/app",
  "/login",
  "/signup",
  "/legal",
  "/privacy",
  "/terms",
] as const;

const ALLOWED_EXTERNAL = new Set(["https://pamphlet.io", "https://wiki.co"]);

export function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  if (/[^\w\-./?#&=%]/.test(path)) return false;
  if (path.includes("..")) return false;
  return ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`),
  );
}

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    const href = `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
    if (ALLOWED_EXTERNAL.has(href) || ALLOWED_EXTERNAL.has(parsed.origin)) {
      return parsed.search === "" && parsed.hash === "";
    }
    // Allow fajita production host only.
    if (
      parsed.hostname === "fajita.io" ||
      parsed.hostname === "www.fajita.io" ||
      parsed.hostname === "localhost"
    ) {
      return isSafeInternalPath(parsed.pathname + (parsed.search || ""));
    }
    return false;
  } catch {
    return false;
  }
}

export function sanitizeAnswerHref(href: string): string | null {
  if (href.startsWith("javascript:") || href.startsWith("data:")) return null;
  if (href.startsWith("/")) {
    return isSafeInternalPath(href) ? href : null;
  }
  return isSafeExternalUrl(href) ? href : null;
}

export function buildAppLink(
  path: string,
  organizationId?: string,
): string | null {
  if (!isSafeInternalPath(path)) return null;
  if (!path.startsWith("/app")) return path;
  // Organization context is server-resolved; never trust org ids in query.
  void organizationId;
  return path;
}
