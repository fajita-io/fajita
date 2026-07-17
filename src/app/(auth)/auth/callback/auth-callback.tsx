"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * Completes an OAuth/social or email-link redirect. Clerk finishes the
 * handshake and forwards the user; failures route to /auth/error.
 */
export function AuthCallback() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      continueSignUpUrl="/signup"
    />
  );
}
