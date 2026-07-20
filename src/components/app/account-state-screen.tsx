import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { BrandButtonLink } from "@/components/design-system/primitives";

const COPY = {
  suspended: {
    title: "This account is on hold.",
    body: "Access is paused right now. Nothing has been deleted. If you think this is a mistake, contact support and we will sort it out.",
  },
  org_unavailable: {
    title: "This organization is unavailable.",
    body: "It may have been removed, or your access changed. Switch to another organization, or reach out if you expected access.",
  },
} as const;

/**
 * Calm, non-alarming full-screen state for suspended accounts or unavailable
 * organizations. No stack traces, no internal detail, a clear next step.
 */
export function AccountStateScreen({
  kind,
}: {
  kind: keyof typeof COPY;
}) {
  const copy = COPY[kind];
  return (
    <div className="fj-authshell fj-authshell--solo">
      <main id="main" className="fj-authshell__panel">
        <div
          className="fj-authshell__form"
          style={{ maxWidth: "32rem", textAlign: "center" }}
        >
          <Link
            href="/"
            aria-label="Fajita home"
            style={{ display: "inline-flex", marginBottom: "var(--space-8)" }}
          >
            <FajitaLogo orientation="horizontal" size={28} />
          </Link>
          <h1 className="fj-heading-2" style={{ marginBottom: "var(--space-4)" }}>
            {copy.title}
          </h1>
          <p className="fj-body" style={{ marginBottom: "var(--space-6)" }}>
            {copy.body}
          </p>
          <BrandButtonLink href="/contact?topic=support">Contact support</BrandButtonLink>
        </div>
      </main>
    </div>
  );
}
