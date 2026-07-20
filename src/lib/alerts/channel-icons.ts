import type { BrandIconName } from "@/components/design-system/icons";
import type { AlertProvider } from "@/lib/alerts/constants";

/** Branded alert-channel glyphs (not third-party logos). */
export const CHANNEL_ICON: Record<AlertProvider, BrandIconName> = {
  email: "channel-email",
  slack: "channel-slack",
  discord: "channel-discord",
  webhook: "webhook",
};

/** Public integrations catalog ids map to the same channel glyphs. */
export const INTEGRATION_CHANNEL_ICON: Record<string, BrandIconName> = {
  email: CHANNEL_ICON.email,
  slack: CHANNEL_ICON.slack,
  discord: CHANNEL_ICON.discord,
  webhook: CHANNEL_ICON.webhook,
};
