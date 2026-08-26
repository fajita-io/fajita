/**
 * Sentry helpers. Init lives in instrumentation files; this module is for
 * app code that needs to capture exceptions without importing the SDK in
 * every call site when the DSN is unset.
 */
import * as Sentry from "@sentry/nextjs";

import { deploymentConfig } from "@/lib/deployment/config";

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!isSentryConfigured()) {
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
  if (!deploymentConfig().telemetryOptIn) {
    return false;
  }
  return Boolean(
    process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
  );
}
