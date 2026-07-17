import "server-only";

import { CONFIRMATION_TTL_HOURS } from "../constants";
import { subscriptionExplanation } from "../consent";
import { loadStatusPageEmailContext, confirmationUrl } from "../context";
import { renderConfirmationEmail } from "../templates";
import type { SimplePreferenceChoice } from "../prefs";
import { sendSubscriberEmail, senderFrom, type SendOutcome } from "./sender";

/**
 * Send exactly one double opt-in confirmation email. Operational updates are
 * never sent before this is confirmed. The confirmation email carries no
 * marketing, no promotion, and no other-product mention: just the status page
 * name, the chosen scope, the confirm link, and an ignore-if-not-requested
 * line. Returns the provider outcome so the caller can record/observe it.
 */

function scopeSummary(choice: SimplePreferenceChoice, componentNames: string[]): string {
  if (choice.allComponents || componentNames.length === 0) return "All components";
  return `Selected components: ${componentNames.join(", ")}`;
}

function eventSummary(choice: SimplePreferenceChoice): string {
  const parts: string[] = [];
  if (choice.incidentUpdates) parts.push("Incident updates");
  if (choice.maintenanceUpdates) parts.push("Maintenance updates");
  return parts.length > 0 ? parts.join(", ") : "None selected";
}

export async function sendConfirmationEmail(input: {
  statusPageId: string;
  email: string;
  confirmationToken: string;
  choice: SimplePreferenceChoice;
  componentNames?: string[];
}): Promise<SendOutcome | null> {
  const ctx = await loadStatusPageEmailContext(input.statusPageId);
  if (!ctx) return null;

  const rendered = renderConfirmationEmail(ctx, {
    confirmUrl: confirmationUrl(input.confirmationToken),
    expiresHours: CONFIRMATION_TTL_HOURS,
    scopeSummary: scopeSummary(input.choice, input.componentNames ?? []),
    eventSummary: eventSummary(input.choice),
    explanation: subscriptionExplanation(),
  });

  return sendSubscriberEmail(senderFrom(ctx.name), {
    to: input.email,
    email: rendered,
    replyTo: ctx.replyTo,
    // No unsubscribe on a confirmation email: there is nothing yet to leave.
  });
}
