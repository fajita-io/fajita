import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader, AppSection } from "@/components/app/ui";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { ApplicationReviewPanel } from "@/components/affiliate/application-review-panel";
import { getApplicationDetail } from "@/lib/affiliates/applications";

export const metadata: Metadata = {
  title: "Application review",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DECIDED = new Set(["approved", "rejected", "blocked"]);

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplicationDetail(id);
  if (!application) notFound();

  return (
    <>
      <PageHeader
        title="Application review"
        description={application.email}
        actions={<StatusBadge status="verifying" label={application.state} />}
      />

      <AppSection title="Applicant">
        <dl className="fj-detail-grid">
          <Field label="Email" value={application.email} />
          <Field label="Country" value={application.country ?? "—"} />
          <Field
            label="Website"
            value={application.website_url ?? "—"}
          />
          <Field
            label="Existing customer"
            value={application.is_existing_customer ? "Yes" : "No"}
          />
          <Field
            label="Promotion methods"
            value={(application.promotion_methods ?? []).join(", ") || "—"}
          />
          <Field
            label="Audience size"
            value={application.audience_size_band ?? "—"}
          />
          <Field label="Paid search" value={application.uses_paid_search ? "Yes" : "No"} />
          <Field
            label="Email marketing"
            value={application.uses_email_marketing ? "Yes" : "No"}
          />
        </dl>
        {application.relevance ? (
          <div style={{ marginTop: "var(--space-4)" }}>
            <p className="fj-fact__label">Why Fajita fits</p>
            <p className="fj-body-sm" style={{ margin: 0 }}>
              {application.relevance}
            </p>
          </div>
        ) : null}
        {application.disclosure_method ? (
          <div style={{ marginTop: "var(--space-4)" }}>
            <p className="fj-fact__label">Disclosure</p>
            <p className="fj-body-sm" style={{ margin: 0 }}>
              {application.disclosure_method}
            </p>
          </div>
        ) : null}
      </AppSection>

      <AppSection title="Review">
        <ApplicationReviewPanel
          applicationId={application.id}
          decided={DECIDED.has(application.state)}
        />
      </AppSection>

      {application.reviews.length > 0 ? (
        <AppSection title="History">
          <ul className="fj-affiliate__history">
            {application.reviews.map((review) => (
              <li key={review.id}>
                <span className="fj-affiliate__linkcode">{review.action}</span>
                <span className="fj-admin-table__secondary">
                  {new Date(review.createdAt).toLocaleString()}
                </span>
                {review.reason ? (
                  <p className="fj-body-sm" style={{ margin: "var(--space-1) 0 0" }}>
                    {review.reason}
                  </p>
                ) : null}
                {review.internalNotes ? (
                  <p className="fj-caption" style={{ margin: "var(--space-1) 0 0" }}>
                    Note: {review.internalNotes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </AppSection>
      ) : null}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="fj-fact__label">{label}</dt>
      <dd className="fj-body-sm" style={{ margin: 0 }}>
        {value}
      </dd>
    </div>
  );
}
