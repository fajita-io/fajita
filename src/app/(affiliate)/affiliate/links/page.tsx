import { PageHeader } from "@/components/app/ui";
import { LinkManager } from "@/components/affiliate/link-manager";
import { requireAffiliate } from "@/lib/affiliates/context";
import { affiliateCan } from "@/lib/affiliates/permissions";
import { listCampaigns, listCodes, listLinks } from "@/lib/affiliates/links";
import type { MembershipState } from "@/lib/affiliates/states";

export const dynamic = "force-dynamic";

export default async function AffiliateLinksPage() {
  const { affiliate } = await requireAffiliate();
  const state = affiliate.membership_state as MembershipState;
  const canManage = affiliateCan(state, "affiliate.links.manage");

  const [codes, campaigns, links] = await Promise.all([
    listCodes(affiliate.id),
    listCampaigns(affiliate.id),
    listLinks(affiliate.id),
  ]);

  return (
    <>
      <PageHeader
        title="Links"
        description="Build referral links, group them into campaigns, and copy them to share."
      />
      <LinkManager
        canManage={canManage}
        codes={codes.map((c) => ({
          id: c.id,
          code: c.code,
          isDefault: c.is_default,
        }))}
        campaigns={campaigns
          .filter((c) => c.status === "active")
          .map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        links={links.map((l) => ({
          id: l.id,
          url: l.url,
          code: l.code,
          destination: l.destination,
          campaignSlug: l.campaignSlug,
        }))}
      />
    </>
  );
}
