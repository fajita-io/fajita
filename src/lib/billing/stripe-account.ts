import "server-only";

import { getStripe } from "@/lib/stripe/server";

const CACHE_TTL_MS = 60_000;

let cached:
  | {
      at: number;
      ready: boolean;
    }
  | null = null;

function envOverride(): boolean | null {
  const raw = process.env.STRIPE_LIVE_PAYMENTS_READY?.trim().toLowerCase();
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return null;
}

/**
 * Whether the connected Stripe account can accept live card payments.
 * Test-mode keys are always treated as ready (Stripe test cards work).
 * Result is cached briefly to avoid hammering Stripe on every page load.
 */
export async function stripeLivePaymentsReady(): Promise<boolean> {
  const override = envOverride();
  if (override !== null) return override;

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (!secretKey.startsWith("sk_live_")) {
    return true;
  }

  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return cached.ready;
  }

  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(null);
  const ready =
    account.charges_enabled === true &&
    account.capabilities?.card_payments === "active";

  cached = { at: now, ready };
  return ready;
}
