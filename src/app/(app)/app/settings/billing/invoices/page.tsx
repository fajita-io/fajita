import type { Metadata } from "next";

import { AppSection, EmptyState } from "@/components/app/ui";
import { requireBillingContext } from "@/lib/app/billing-page";
import { serviceClient } from "@/lib/supabase/service";
import { formatUsdCents } from "@/lib/billing/mrr";

export const metadata: Metadata = {
  title: "Invoices",
  robots: { index: false, follow: false },
};

const KIND_LABEL: Record<string, string> = {
  paid: "Paid",
  failed: "Payment failed",
  action_required: "Action needed",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
  finalized: "Issued",
};

export default async function BillingInvoicesPage() {
  const { organizationId } = await requireBillingContext();
  const db = serviceClient();
  const { data } = await db
    .from("billing_payment_events")
    .select("*")
    .eq("organization_id", organizationId)
    .order("occurred_at", { ascending: false })
    .limit(50);

  const events = data ?? [];

  return (
    <AppSection
      title="Invoices and receipts"
      description="Issued by Stripe. Open a hosted invoice for the full receipt and PDF."
    >
      {events.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Invoices appear here after your first payment. Stripe emails a receipt for every charge."
        />
      ) : (
        <div className="fj-table-scroll">
          <table className="fj-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col">Amount</th>
                <th scope="col">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    {new Date(ev.occurred_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>{KIND_LABEL[ev.kind] ?? ev.kind}</td>
                  <td>
                    {formatUsdCents(ev.amount_cents)}{" "}
                    {ev.currency.toUpperCase()}
                  </td>
                  <td>
                    {ev.hosted_invoice_url ? (
                      <a
                        href={ev.hosted_invoice_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppSection>
  );
}
