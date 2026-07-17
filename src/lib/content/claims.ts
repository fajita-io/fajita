/**
 * Product claims that must not appear as unsupported Fajita capabilities.
 * Align with Phase 14 glossary claims and public claims registry.
 */

export const FORBIDDEN_PRODUCT_CLAIMS = [
  "full observability",
  "apm",
  "distributed tracing",
  "log aggregation",
  "log pipeline",
  "agent-based",
  "install an agent",
  "sms alerts",
  "phone alerts",
  "mobile app",
  "free forever monitoring",
  "free plan",
  "soc 2 certified",
  "soc 2 compliant",
  "hipaa compliant",
  "iso 27001",
  "99.99% sla guarantee",
] as const;

export function findForbiddenClaims(text: string): string[] {
  const lower = text.toLowerCase();
  return FORBIDDEN_PRODUCT_CLAIMS.filter((phrase) => {
    if (!lower.includes(phrase)) return false;
    // Allow explicit negation near the phrase.
    const idx = lower.indexOf(phrase);
    const window = lower.slice(Math.max(0, idx - 60), idx + phrase.length + 60);
    if (
      window.includes("does not") ||
      window.includes("do not") ||
      window.includes("will not") ||
      window.includes("not offer") ||
      window.includes("not include") ||
      window.includes("not need") ||
      window.includes("without ") ||
      window.includes("no agents") ||
      window.includes("no log") ||
      window.includes("no apm") ||
      window.includes("refuse") ||
      /\bno\b/.test(window) ||
      /\bnot\b/.test(window)
    ) {
      return false;
    }
    return true;
  });
}
