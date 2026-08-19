import Link from "next/link";

import { confirmAlertRecipient } from "@/lib/alerts/recipient-verification";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyAlertRecipientPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const result = await confirmAlertRecipient(token ?? "");

  if (result.kind === "confirmed" || result.kind === "already_confirmed") {
    return (
      <section className="sub-card" aria-labelledby="verify-title">
        <span className="sub-badge">Address confirmed</span>
        <h1 id="verify-title">This address can receive alerts</h1>
        <p>
          {result.kind === "already_confirmed"
            ? "This address was already confirmed."
            : "You will receive incident alerts sent to this address. We only send operational email, never marketing."}
        </p>
        <div className="sub-actions">
          <Link className="sub-btn sub-btn--primary" href="https://fajita.io">
            Go to Fajita
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="sub-card" aria-labelledby="verify-title">
      <h1 id="verify-title">This link is not valid</h1>
      <p>
        The confirmation link is invalid or has already been used. Ask your teammate to resend
        the verification email from the alert channel.
      </p>
    </section>
  );
}
