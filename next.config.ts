import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {};

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
