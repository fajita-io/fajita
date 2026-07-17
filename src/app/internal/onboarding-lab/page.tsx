import {
  LIFECYCLE_MESSAGES,
  type LifecycleMessageKey,
} from "@/lib/lifecycle/messages";
import { LIFECYCLE_EMAIL_FIXTURES } from "@/lib/lifecycle/emails/fixtures";
import { renderLifecycleEmail } from "@/lib/lifecycle/emails/templates";
import { OnboardingLabClient, type LabPreview } from "./onboarding-lab-client";

/**
 * Internal onboarding lab (guarded by the layout). Renders every lifecycle
 * email template from deterministic fixtures for desktop, mobile, and
 * plain-text review. Nothing here sends email or touches customer data.
 */

export const dynamic = "force-dynamic";

export default function OnboardingLabPage() {
  const previews: LabPreview[] = [];
  for (const key of Object.keys(LIFECYCLE_MESSAGES) as LifecycleMessageKey[]) {
    const definition = LIFECYCLE_MESSAGES[key];
    const fixture = LIFECYCLE_EMAIL_FIXTURES[key];
    const rendered = renderLifecycleEmail(
      key,
      definition.templateVersion,
      fixture,
    );
    if (!rendered) continue;
    previews.push({
      key,
      label: definition.label,
      messageClass: definition.class,
      templateVersion: definition.templateVersion,
      subject: rendered.subject,
      previewText: rendered.previewText,
      html: rendered.html,
      text: rendered.text,
    });
  }
  return <OnboardingLabClient previews={previews} />;
}
