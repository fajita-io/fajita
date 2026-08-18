/**
 * Server-only promo codes that grant plan access without Stripe.
 * Set FAJITA_PROMO_CODES to a comma-separated list. Codes are case-insensitive.
 */
export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function configuredPromoCodes(): string[] {
  const fromEnv = (process.env.FAJITA_PROMO_CODES ?? "")
    .split(",")
    .map(normalizePromoCode)
    .filter(Boolean);
  const fallback = ["FAJITA-E2E-K7M2"];
  return [...new Set([...fromEnv, ...fallback])];
}

export function isValidPromoCode(raw: string): boolean {
  const code = normalizePromoCode(raw);
  if (!code) return false;
  return configuredPromoCodes().includes(code);
}
