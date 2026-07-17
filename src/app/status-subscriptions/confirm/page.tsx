import Link from "next/link";

import { confirmSubscription } from "@/lib/subscribers/confirm";
import { appUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

function statusPageHref(slug: string | null | undefined): string {
  if (!slug) return "/";
  return `${appUrl}/status/${slug}`;
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const result = await confirmSubscription(token ?? "");

  if (result.kind === "confirmed" || result.kind === "already_confirmed") {
    const slug =
      result.kind === "confirmed" ? result.statusPageSlug : result.statusPageSlug;
    const prefToken =
      result.kind === "confirmed" ? result.preferenceToken : undefined;
    return (
      <section className="sub-card" aria-labelledby="confirm-title">
        <span className="sub-badge">Subscription confirmed</span>
        <h1 id="confirm-title">You are subscribed</h1>
        <p>
          {result.kind === "already_confirmed"
            ? "This subscription was already confirmed. You will receive the updates you selected."
            : "You will receive the updates you selected for this status page. We only send operational incident and maintenance email, never marketing."}
        </p>
        <div className="sub-actions">
          {prefToken ? (
            <Link
              className="sub-btn sub-btn--ghost"
              href={`/status-subscriptions/preferences?token=${encodeURIComponent(prefToken)}`}
            >
              Update preferences
            </Link>
          ) : null}
          {slug ? (
            <a className="sub-btn sub-btn--primary" href={statusPageHref(slug)}>
              Return to status page
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  if (result.kind === "expired") {
    return (
      <section className="sub-card" aria-labelledby="confirm-title">
        <h1 id="confirm-title">This confirmation link expired</h1>
        <p>
          For your security, confirmation links expire. Subscribe again from the
          status page to receive a fresh confirmation email.
        </p>
      </section>
    );
  }

  if (result.kind === "unavailable") {
    return (
      <section className="sub-card" aria-labelledby="confirm-title">
        <h1 id="confirm-title">Subscription unavailable</h1>
        <p>{result.reason}</p>
      </section>
    );
  }

  return (
    <section className="sub-card" aria-labelledby="confirm-title">
      <h1 id="confirm-title">This link is not valid</h1>
      <p>
        The confirmation link is invalid or has already been used. If you still
        want updates, subscribe again from the status page.
      </p>
    </section>
  );
}
