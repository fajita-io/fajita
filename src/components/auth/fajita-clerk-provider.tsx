"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/auth/clerk-appearance";
import {
  clerkSignInFallbackRedirectUrl,
  clerkSignInUrl,
  clerkSignUpFallbackRedirectUrl,
  clerkSignUpUrl,
} from "@/lib/auth/clerk-config";

/** Clerk shell for authenticated and auth routes only. Marketing pages omit this. */
export function FajitaClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl={clerkSignInUrl}
      signUpUrl={clerkSignUpUrl}
      signInFallbackRedirectUrl={clerkSignInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={clerkSignUpFallbackRedirectUrl}
    >
      {children}
    </ClerkProvider>
  );
}
