import { PageHeader, AppSection } from "@/components/app/ui";
import { requireAffiliate } from "@/lib/affiliates/context";
import { getPerformanceSummary } from "@/lib/affiliates/metrics";

export const dynamic = "force-dynamic";

export default async function AffiliatePerformancePage() {
  const { affiliate } = await requireAffiliate();
  const summary = await getPerformanceSummary(affiliate.id);

  return (
    <>
      <PageHeader
        title="Performance"
        description="Clicks that count, signups you sent, and referrals that are paying."
      />

      <AppSection
        title="Funnel"
        description="Eligible clicks are human visits that can earn attribution."
      >
        <div className="fj-affiliate__stats">
          <Stat label="Eligible clicks" value={String(summary.eligibleClicks)} />
          <Stat label="Signups" value={String(summary.referredSignups)} />
          <Stat
            label="Active referrals"
            value={String(summary.activeConversions)}
          />
        </div>
        {summary.totalClicks > summary.eligibleClicks ? (
          <p className="fj-body-sm">
            {summary.totalClicks - summary.eligibleClicks} clicks were filtered
            as bots, duplicates, or self visits and do not earn.
          </p>
        ) : null}
      </AppSection>

      <AppSection
        title="By campaign"
        description="Where your clicks come from."
      >
        {summary.campaigns.length === 0 ? (
          <p className="fj-body-sm">
            No clicks yet. Share your link and this fills in.
          </p>
        ) : (
          <table className="fj-admin-table">
            <thead>
              <tr>
                <th scope="col">Campaign</th>
                <th scope="col">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {summary.campaigns.map((c) => (
                <tr key={c.campaignId ?? "direct"}>
                  <td>{c.name}</td>
                  <td>{c.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AppSection>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="fj-affiliate__stat">
      <span className="fj-affiliate__stat-value">{value}</span>
      <span className="fj-affiliate__stat-label">{label}</span>
    </div>
  );
}
