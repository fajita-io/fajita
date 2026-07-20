import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

import {
  authProductionReady,
  evaluateAuthProductionReadiness,
} from "@/lib/auth/production-readiness";
import { buildSecurityHeaders } from "@/lib/security/headers";

/** Fail Vercel production builds when auth/billing env is incomplete. */
function assertProductionAuthEnv() {
  const onVercelProductionBuild =
    process.env.VERCEL === "1" &&
    process.env.VERCEL_ENV === "production" &&
    Boolean(process.env.VERCEL_GIT_COMMIT_SHA);

  if (!onVercelProductionBuild) return;

  if (!authProductionReady({ production: true })) {
    const failed = evaluateAuthProductionReadiness({ production: true })
      .filter((c) => !c.ok)
      .map((c) => `${c.id} (${c.detail})`);
    throw new Error(
      `Production auth/billing env incomplete:\n${failed.join("\n")}\nSee docs/operations/auth-production-setup.md`,
    );
  }
}

assertProductionAuthEnv();

const nextConfig: NextConfig = {
  headers: buildSecurityHeaders(),
};

export default withSentryConfig(nextConfig, {
  // Org/project upload only when SENTRY_AUTH_TOKEN is present.
  silent: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  disableLogger: true,
  tunnelRoute: undefined,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
