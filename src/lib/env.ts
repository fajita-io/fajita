/**
 * Typed environment access for Fajita.
 *
 * Two surfaces, deliberately separated so a server-only secret can never be
 * imported into a client bundle:
 *
 * - `publicEnv`: `NEXT_PUBLIC_*` values, safe to read anywhere.
 * - `serverEnv()`: secrets and server config, validated lazily. Importing this
 *   file is safe from the client; calling `serverEnv()` from a client component
 *   throws at runtime instead of leaking values.
 *
 * We validate on access rather than at module load so that a missing optional
 * integration (email, for example) never crashes an unrelated route, while a
 * missing required secret fails loudly at the point of use with a clear name.
 */

import { z } from "zod";

const nonEmpty = z.string().min(1);

/* ------------------------------------------------------------------ */
/* Public env (client-safe)                                            */
/* ------------------------------------------------------------------ */

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://fajita.io"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmpty,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: nonEmpty,
});

/**
 * Read once. Next.js inlines `NEXT_PUBLIC_*` at build time, so we reference the
 * variables explicitly (destructuring `process.env` dynamically would break
 * that inlining).
 */
const rawPublic = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
};

let cachedPublic: z.infer<typeof publicSchema> | null = null;

export function publicEnv(): z.infer<typeof publicSchema> {
  if (cachedPublic) return cachedPublic;
  const parsed = publicSchema.safeParse(rawPublic);
  if (!parsed.success) {
    // Public config missing is a deploy misconfiguration; surface the names.
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid public env: ${missing}`);
  }
  cachedPublic = parsed.data;
  return cachedPublic;
}

export const appUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io"
).replace(/\/$/, "");

/* ------------------------------------------------------------------ */
/* Server env (secret)                                                 */
/* ------------------------------------------------------------------ */

const serverSchema = z
  .object({
    CLERK_SECRET_KEY: nonEmpty,
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: nonEmpty,
  DATABASE_URL: z.string().optional(),
  /**
   * Comma-separated Clerk user ids that hold the platform-admin role. Never a
   * public email suffix. Empty by default (no admins) which is the safe state.
   */
  PLATFORM_ADMIN_USER_IDS: z.string().optional(),
  /**
   * Versioned keyring for monitor-secret envelope encryption (AES-256-GCM).
   * Format: `version:base64key` entries separated by commas, e.g.
   * `1:<base64 of 32 raw bytes>`. The highest version is the active key used
   * for new encryptions; older versions stay present to decrypt existing rows
   * during rotation. Server-only; never exposed to the browser or the worker
   * except through its own restricted secret injection.
   */
  MONITOR_SECRET_KEYRING: z.string().optional(),
  /**
   * Alert email delivery (Resend). Optional: when unset, email channels report
   * a clear "email delivery is not configured" result instead of failing hard.
   */
  RESEND_API_KEY: z.string().optional(),
  ALERT_EMAIL_FROM: z.string().optional(),
  /**
   * Shared token the standalone alert delivery worker presents to the internal
   * run endpoint. When unset, the internal trigger route is disabled.
   */
  ALERT_WORKER_TOKEN: z.string().optional(),
  /**
   * Status-page subscriber system (Phase 9). All optional so an unconfigured
   * environment degrades safely (confirmation/delivery report "not configured"
   * rather than crashing). Subscriber email reuses the Resend transactional
   * stream (RESEND_API_KEY / ALERT_EMAIL_FROM).
   *
   * - SUBSCRIBER_WORKER_TOKEN: bearer token for POST /api/internal/subscribers/run.
   * - SUBSCRIBER_EMAIL_WEBHOOK_SECRET: Svix/Resend signing secret used to verify
   *   inbound bounce/complaint/delivery callbacks. When unset, the callback
   *   endpoint rejects all traffic (fail closed).
   */
  SUBSCRIBER_WORKER_TOKEN: z.string().optional(),
  SUBSCRIBER_EMAIL_WEBHOOK_SECRET: z.string().optional(),
  /**
   * Lifecycle + report system (Phase 11). Bearer token for
   * POST /api/internal/lifecycle/run (rule evaluation, delivery, reports).
   * When unset, the internal trigger route is disabled.
   */
  LIFECYCLE_WORKER_TOKEN: z.string().optional(),
  /**
   * Affiliate program (Phase 12). All optional so an unconfigured environment
   * degrades safely.
   *
   * - AFFILIATE_COOKIE_SECRET: HMAC key used to sign the opaque first-party
   *   referral cookie. When unset, referral attribution falls back to an
   *   unsigned opaque id (development only); production requires this set.
   * - AFFILIATE_WORKER_TOKEN: bearer token for POST /api/internal/affiliates/run
   *   (conversion processing, commission calculation, notifications, exports,
   *   reconciliation). When unset, the internal trigger route is disabled.
   * - STRIPE_CONNECT_CLIENT_ID: Stripe Connect platform client id, used for
   *   Express onboarding. When unset, payout provider onboarding reports "not
   *   configured" and the manual payout fallback is used.
   */
  AFFILIATE_COOKIE_SECRET: z.string().optional(),
  AFFILIATE_WORKER_TOKEN: z.string().optional(),
  STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
  /**
   * Vercel Cron bearer for GET /api/cron/tick. When unset, the cron route
   * returns 404. Prefer a long random value in production.
   */
  CRON_SECRET: z.string().optional(),
})
  .superRefine((data, ctx) => {
    if (process.env.NODE_ENV === "production") {
      const wh = data.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
      if (!wh || !wh.startsWith("whsec_")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "CLERK_WEBHOOK_SIGNING_SECRET is required in production (whsec_…)",
          path: ["CLERK_WEBHOOK_SIGNING_SECRET"],
        });
      }
    }
  });

let cachedServer: z.infer<typeof serverSchema> | null = null;

export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called in the browser");
  }
  if (cachedServer) return cachedServer;
  const parsed = serverSchema.safeParse({
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    PLATFORM_ADMIN_USER_IDS: process.env.PLATFORM_ADMIN_USER_IDS,
    MONITOR_SECRET_KEYRING: process.env.MONITOR_SECRET_KEYRING,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ALERT_EMAIL_FROM: process.env.ALERT_EMAIL_FROM,
    ALERT_WORKER_TOKEN: process.env.ALERT_WORKER_TOKEN,
    SUBSCRIBER_WORKER_TOKEN: process.env.SUBSCRIBER_WORKER_TOKEN,
    SUBSCRIBER_EMAIL_WEBHOOK_SECRET:
      process.env.SUBSCRIBER_EMAIL_WEBHOOK_SECRET,
    LIFECYCLE_WORKER_TOKEN: process.env.LIFECYCLE_WORKER_TOKEN,
    AFFILIATE_COOKIE_SECRET: process.env.AFFILIATE_COOKIE_SECRET,
    AFFILIATE_WORKER_TOKEN: process.env.AFFILIATE_WORKER_TOKEN,
    STRIPE_CONNECT_CLIENT_ID: process.env.STRIPE_CONNECT_CLIENT_ID,
    CRON_SECRET: process.env.CRON_SECRET,
  });
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid server env: ${missing}`);
  }
  cachedServer = parsed.data;
  return cachedServer;
}

/** Platform-admin allowlist, parsed from `PLATFORM_ADMIN_USER_IDS`. */
export function platformAdminIds(): ReadonlySet<string> {
  const raw = process.env.PLATFORM_ADMIN_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
