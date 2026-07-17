/**
 * Customer-facing Ask Fajita microcopy.
 * No em dashes. No AI slop. No fake empathy. No human impersonation.
 */

export const SUPPORT_IDENTITY = {
  name: "Ask Fajita",
  altName: "Fajita Support",
  launcherLabel: "Ask Fajita",
  launcherHelpLabel: "Get Help",
} as const;

export const SUPPORT_COPY = {
  publicGreeting:
    "Ask a question about monitoring, alerts, status pages, pricing, or setup.",
  authenticatedGreeting:
    "Ask about this organization’s monitors, incidents, alerts, status pages, usage, or account setup.",
  groundingNote:
    "I answer from Fajita’s approved product documentation and the account information you are authorized to view.",
  composerWarning:
    "Do not send passwords, API keys, webhook secrets, heartbeat tokens, or payment information.",
  composerPlaceholder: "Type your question",
  newConversation: "New conversation",
  history: "History",
  privacy: "Privacy",
  close: "Close",
  handoffCta: "Send to Fajita support",
  handoffExplain:
    "I can send this conversation to Fajita support. You will get a reply by email when a person reviews it.",
  handoffConfirm:
    "Send the redacted conversation, safe account context, and your contact email to Fajita support?",
  contactEmailPrompt:
    "Enter an email address if you want Fajita support to reply to this conversation.",
  insufficientEvidence:
    "I could not verify that from Fajita’s approved documentation.",
  accountAccessRequired:
    "Sign in and select the organization you want to review, or open support from inside the Fajita application.",
  humanReviewRequired:
    "This needs a person to review the account details. I can send the conversation to Fajita support.",
  permissionDenied:
    "Your current role does not allow access to that information. An organization owner or authorized administrator can review it.",
  unsupportedAction:
    "I can explain the steps, but I cannot make that account change from chat.",
  providerUnavailableTitle: "Support is temporarily unavailable",
  providerUnavailableBody:
    "The chat service could not connect. You can still search Fajita’s documentation or contact support through the approved fallback channel.",
  sensitiveDetected:
    "That message appears to contain a credential. I removed it from the support request. Rotate the credential if it was active, then describe the error without pasting the secret.",
  englishOnly: "Fajita support is currently available in English.",
  featureRequestRecorded:
    "I recorded the request for review. This does not confirm that the feature is planned.",
  securityReport:
    "This may involve a security issue. Please use Fajita’s responsible disclosure process so the report reaches the restricted security channel.",
  noSms:
    "Fajita does not currently support SMS or phone alerts. Launch alert channels are email, Slack, Discord, and generic webhooks.",
  noFreePlan:
    "Fajita does not currently offer a free plan. See pricing for active plans and limits.",
  helpful: "Helpful",
  notHelpful: "Not helpful",
  retry: "Retry",
  searchDocs: "Search documentation",
  openTroubleshooting: "Open troubleshooting",
  contactSupport: "Contact support",
  copyUnsent: "Copy unsent message",
  poweredBy: "Powered by Pamphlet",
  humanLabel: "Fajita Support",
  automatedLabel: "Ask Fajita",
  emptyState:
    "Nothing here yet. Ask about monitoring, alerts, status pages, or pricing.",
  errorState:
    "That did not send. Your draft is still here. Try again, or use documentation and contact support.",
  offlineState:
    "You appear offline. Your draft is saved in this session. Reconnect to send.",
} as const;

export const FALLBACK_SUPPORT_HREF = "/contact?topic=support";
export const DOCS_SEARCH_HREF = "/docs";
export const TROUBLESHOOTING_HREF = "/docs/troubleshooting/check-blocked";
