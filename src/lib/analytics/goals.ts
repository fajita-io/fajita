/**
 * Custom goal names for fajita.io.
 *
 * Do not use reserved payment-provider goal names (payment, free_trial,
 * trial_started, subscription_*, etc.). See:
 * https://datafa.st/docs/custom-goals
 */
export const DataFastGoals = {
  signup: "signup",
  signIn: "sign_in",
  newsletterSubscribe: "newsletter_subscribe",
  initiateCheckout: "initiate_checkout",
  waitlistJoin: "waitlist_join",
  demoRequest: "demo_request",
  firstMonitor: "first_monitor",
  monitorCreated: "monitor_created",
  alertChannelAdded: "alert_channel_added",
  statusPagePublished: "status_page_published",
  inviteSent: "invite_sent",
  onboardingComplete: "onboarding_complete",
} as const;

export type DataFastGoalName =
  (typeof DataFastGoals)[keyof typeof DataFastGoals];

const GOAL_NAME_PATTERN = /^[a-z0-9_:-]{1,64}$/;

export function isValidGoalName(name: string): name is DataFastGoalName {
  return GOAL_NAME_PATTERN.test(name);
}

export function sanitizeGoalParams(
  params?: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> | undefined {
  if (!params) return undefined;

  const sanitized: Record<string, string> = {};
  let count = 0;

  for (const [key, value] of Object.entries(params)) {
    if (count >= 10) break;
    if (value == null) continue;
    if (!/^[a-z0-9_-]{1,64}$/.test(key)) continue;

    sanitized[key] = String(value).slice(0, 255);
    count += 1;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}
