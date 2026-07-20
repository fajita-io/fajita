/**
 * Clerk redirect URLs. Read from env with safe defaults matching .env.example.
 * ClerkProvider and middleware rely on these staying in sync with app routes.
 */

export const clerkSignInUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/login";

export const clerkSignUpUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/signup";

export const clerkSignInFallbackRedirectUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/app";

export const clerkSignUpFallbackRedirectUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ??
  "/app/new-organization";

export function clerkPublishableKeyMode(
  key: string | undefined,
): "live" | "test" | "unknown" {
  if (!key) return "unknown";
  if (key.startsWith("pk_live_")) return "live";
  if (key.startsWith("pk_test_")) return "test";
  return "unknown";
}

export function clerkSecretKeyMode(
  key: string | undefined,
): "live" | "test" | "unknown" {
  if (!key) return "unknown";
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return "unknown";
}
