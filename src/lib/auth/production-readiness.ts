import {
  clerkPublishableKeyMode,
  clerkSecretKeyMode,
} from "./clerk-config";

export type ReadinessCheck = {
  id: string;
  ok: boolean;
  detail: string;
};

/**
 * Validates Clerk + Supabase + Stripe env wiring for the current deployment.
 * Does not print secret values. Safe to log results in CI.
 */
export function evaluateAuthProductionReadiness(options?: {
  /** When true, require live Clerk keys and webhook secrets. */
  production?: boolean;
}): ReadinessCheck[] {
  const production =
    options?.production ?? process.env.NODE_ENV === "production";
  const checks: ReadinessCheck[] = [];

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const sk = process.env.CLERK_SECRET_KEY;
  const pkMode = clerkPublishableKeyMode(pk);
  const skMode = clerkSecretKeyMode(sk);

  checks.push({
    id: "clerk_publishable_key",
    ok: Boolean(pk && pkMode !== "unknown"),
    detail: pk ? `present (${pkMode})` : "missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  });
  checks.push({
    id: "clerk_secret_key",
    ok: Boolean(sk && skMode !== "unknown"),
    detail: sk ? `present (${skMode})` : "missing CLERK_SECRET_KEY",
  });
  checks.push({
    id: "clerk_key_pair_match",
    ok: pkMode !== "unknown" && skMode !== "unknown" && pkMode === skMode,
    detail:
      pkMode !== "unknown" && skMode !== "unknown"
        ? pkMode === skMode
          ? `publishable and secret both ${pkMode}`
          : `mismatch: publishable ${pkMode}, secret ${skMode}`
        : "cannot compare key modes",
  });

  if (production) {
    checks.push({
      id: "clerk_live_keys",
      ok: pkMode === "live" && skMode === "live",
      detail:
        pkMode === "live" && skMode === "live"
          ? "live Clerk keys configured"
          : "production requires pk_live_ and sk_live_ keys",
    });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
  checks.push({
    id: "clerk_webhook_secret",
    ok: Boolean(webhookSecret && webhookSecret.startsWith("whsec_")),
    detail: webhookSecret
      ? "CLERK_WEBHOOK_SIGNING_SECRET present"
      : production
        ? "missing CLERK_WEBHOOK_SIGNING_SECRET (required in production)"
        : "optional in development (webhook verify will fail without it)",
  });

  checks.push({
    id: "supabase_url",
    ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    detail: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "NEXT_PUBLIC_SUPABASE_URL present"
      : "missing NEXT_PUBLIC_SUPABASE_URL",
  });
  checks.push({
    id: "supabase_anon_key",
    ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    detail: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "NEXT_PUBLIC_SUPABASE_ANON_KEY present"
      : "missing NEXT_PUBLIC_SUPABASE_ANON_KEY",
  });
  checks.push({
    id: "supabase_service_role",
    ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    detail: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "SUPABASE_SERVICE_ROLE_KEY present"
      : "missing SUPABASE_SERVICE_ROLE_KEY",
  });

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET;
  const stripePk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  checks.push({
    id: "stripe_secret_key",
    ok: Boolean(stripeSecret),
    detail: stripeSecret ? "STRIPE_SECRET_KEY present" : "missing STRIPE_SECRET_KEY",
  });
  checks.push({
    id: "stripe_publishable_key",
    ok: Boolean(stripePk),
    detail: stripePk
      ? "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY present"
      : "missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  });
  checks.push({
    id: "stripe_webhook_secret",
    ok: Boolean(stripeWebhook?.startsWith("whsec_")),
    detail: stripeWebhook
      ? "STRIPE_WEBHOOK_SECRET present"
      : production
        ? "missing STRIPE_WEBHOOK_SECRET (required for billing sync)"
        : "optional in development",
  });

  if (production) {
    const stripeLive =
      stripeSecret?.startsWith("sk_live_") &&
      stripePk?.startsWith("pk_live_");
    checks.push({
      id: "stripe_live_keys",
      ok: Boolean(stripeLive),
      detail: stripeLive
        ? "live Stripe keys configured"
        : "production requires pk_live_ and sk_live_ Stripe keys",
    });
  }

  checks.push({
    id: "app_url",
    ok: Boolean(process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")),
    detail: process.env.NEXT_PUBLIC_APP_URL
      ? `NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL}`
      : "missing NEXT_PUBLIC_APP_URL",
  });

  return checks;
}

export function authProductionReady(options?: {
  production?: boolean;
}): boolean {
  const checks = evaluateAuthProductionReadiness(options);
  const requiredInProd = new Set([
    "clerk_publishable_key",
    "clerk_secret_key",
    "clerk_key_pair_match",
    "clerk_live_keys",
    "clerk_webhook_secret",
    "supabase_url",
    "supabase_anon_key",
    "supabase_service_role",
    "stripe_secret_key",
    "stripe_publishable_key",
    "stripe_webhook_secret",
    "stripe_live_keys",
    "app_url",
  ]);

  const production =
    options?.production ?? process.env.NODE_ENV === "production";

  return checks.every((c) => {
    if (!production && requiredInProd.has(c.id) && c.id.includes("live")) {
      return true;
    }
    if (!production && c.id === "clerk_webhook_secret") {
      return true;
    }
    if (production && requiredInProd.has(c.id)) {
      return c.ok;
    }
    if (
      !production &&
      [
        "clerk_publishable_key",
        "clerk_secret_key",
        "clerk_key_pair_match",
        "supabase_url",
        "supabase_anon_key",
        "supabase_service_role",
      ].includes(c.id)
    ) {
      return c.ok;
    }
    return true;
  });
}
