import "server-only";

import { unstable_rethrow } from "next/navigation";

import { AppAuthError } from "@/lib/auth/errors";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; kind?: string };

/**
 * Map any thrown error to a safe, plain-language action result. Never leaks
 * SQL, provider objects, or stack traces to the client. Known AppAuthError
 * messages are already user-safe; everything else becomes a generic message
 * and is logged server-side.
 *
 * Next.js control-flow errors (redirect, notFound) must propagate.
 */
export function toActionError(error: unknown): ActionResult<never> {
  unstable_rethrow(error);
  if (error instanceof AppAuthError) {
    return { ok: false, error: error.message, kind: error.kind };
  }
  console.error("[action] unexpected error", error);
  return { ok: false, error: "Something went wrong. Try again in a moment." };
}
