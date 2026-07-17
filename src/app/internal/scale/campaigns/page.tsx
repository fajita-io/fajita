import type { Metadata } from "next";

import { ScaleSubnav } from "@/components/platform/scale-subnav";
import {
  OpsBreadcrumbs,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

import { FIXTURE_CAMPAIGNS, canLaunchCampaign, buildCampaignUrl, CAMPAIGN_ALLOWLIST_PARAMS } from "@/lib/scale";

const launchChecks = FIXTURE_CAMPAIGNS.map((c) => ({ campaign: c, launch: canLaunchCampaign(c) }));
const urlPreview = buildCampaignUrl({
  basePath: "/pricing",
  source: "newsletter",
  medium: "sponsorship",
  campaign: "fixture-preview",
  siteOrigin: "https://fajita.io",
});


export const metadata: Metadata = {
  title: "Campaign registry",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/scale", label: "Scale" },
          { label: "Campaign registry" },
        ]}
      />
      <OpsPageHeader
        title={"Campaign registry"}
        deck={"No campaign launches without approval, capacity review, support review, and claims review."}
      />
      <ScaleSubnav current={"/internal/scale/campaigns"} />

      <OpsPanel title="Campaigns">
        <table className="fj-ops-table">
          <thead><tr><th>Name</th><th>Channel</th><th>Status</th><th>Budget</th><th>Spend</th><th>Can launch</th></tr></thead>
          <tbody>
            {launchChecks.map(({ campaign, launch }) => (
              <tr key={campaign.id}>
                <td>{campaign.name}</td>
                <td>{campaign.channelKey}</td>
                <td>{campaign.status}</td>
                <td>{`$${(campaign.budgetCents / 100).toFixed(0)}`}</td>
                <td>{`$${(campaign.spendCents / 100).toFixed(0)}`}</td>
                <td>{launch.allowed ? "Yes" : launch.reasons[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>
      <OpsPanel title="URL builder allowlist">
        <p className="fj-ops-empty">Allowed params: {CAMPAIGN_ALLOWLIST_PARAMS.join(", ")}. No email, org name, or secrets.</p>
        <p className="fj-ops-empty">Preview: {urlPreview.errors.length ? urlPreview.errors.join("; ") : urlPreview.url}</p>
      </OpsPanel>

    </>
  );
}
