/**
 * Sentry helpers. Init lives in instrumentation files; this module is for
 * app code that needs to capture exceptions without importing the SDK in
 * every call site when the DSN is unset.
 */
import * as Sentry from "@sentry/nextjs";

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
    return;
  }
  Sentry.captureException(error);
}

export function isSentryConfigured(): boolean {
  return Boolean(
    process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
  );
}
