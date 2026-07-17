import { subscriberIdForToken } from "@/lib/subscribers/preferences";
import { confirmUnsubscribeAction } from "./actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ token?: string; done?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token, done } = await searchParams;

  if (done === "1") {
    return (
      <section className="sub-card" aria-labelledby="unsub-title">
        <span className="sub-badge">Unsubscribed</span>
        <h1 id="unsub-title">You are unsubscribed</h1>
        <p>
          You will not receive further updates. If this was a mistake, subscribe
          again from the status page and confirm the new request.
        </p>
      </section>
    );
  }

  const resolved = token ? await subscriberIdForToken(token) : null;
  if (!resolved) {
    return (
      <section className="sub-card" aria-labelledby="unsub-title">
        <h1 id="unsub-title">This link is not valid</h1>
        <p>
          The unsubscribe link is invalid or has been replaced. Use the link in
          your most recent status email.
        </p>
      </section>
    );
  }

  return (
    <section className="sub-card" aria-labelledby="unsub-title">
      <h1 id="unsub-title">Unsubscribe</h1>
      <p>
        Confirm that you want to stop receiving email from this status page. You
        can subscribe again at any time.
      </p>
      <form action={confirmUnsubscribeAction}>
        <input type="hidden" name="token" value={token} />
        <div className="sub-actions">
          <button type="submit" className="sub-btn sub-btn--primary">
            Unsubscribe
          </button>
          <a
            className="sub-btn sub-btn--ghost"
            href={`/status-subscriptions/preferences?token=${encodeURIComponent(token ?? "")}`}
          >
            Update preferences instead
          </a>
        </div>
      </form>
    </section>
  );
}
