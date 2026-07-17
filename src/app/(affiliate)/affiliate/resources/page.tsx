import { PageHeader, AppSection } from "@/components/app/ui";
import { CopyField } from "@/components/affiliate/copy-field";
import { CopySnippet } from "@/components/affiliate/copy-snippet";
import { requireAffiliate } from "@/lib/affiliates/context";
import { buildReferralUrl, getDefaultCode } from "@/lib/affiliates/links";
import { serviceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

interface Creative {
  id: string;
  title: string;
  kind: string;
  dimensions: string | null;
  intendedUse: string | null;
}

async function listCreatives(): Promise<Creative[]> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_creatives")
    .select("id, title, kind, dimensions, intended_use")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    kind: c.kind,
    dimensions: c.dimensions,
    intendedUse: c.intended_use,
  }));
}

export default async function AffiliateResourcesPage() {
  const { affiliate } = await requireAffiliate();
  const [defaultCode, creatives] = await Promise.all([
    getDefaultCode(affiliate.id),
    listCreatives(),
  ]);

  const link = defaultCode
    ? buildReferralUrl({ code: defaultCode.code, destination: "/" })
    : null;

  const snippets = link
    ? [
        {
          label: "One-liner",
          value: `Fajita watches your sites, APIs, and cron jobs and tells you before your customers do. ${link}`,
        },
        {
          label: "Short post",
          value: `Downtime is expensive and quiet. Fajita monitors your websites, APIs, SSL certificates, and cron jobs, then alerts your team the moment something starts to slip. Try it: ${link}`,
        },
        {
          label: "For a newsletter",
          value: `I run my uptime monitoring on Fajita. It checks sites, APIs, certificates, and scheduled jobs, and it pings me before anything reaches a customer. Public status pages come built in. If you own something that has to stay up, take a look: ${link}`,
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Resources"
        description="Your link and ready-to-use copy. Say what is true and let the product carry it."
      />

      <AppSection
        title="Your link"
        description="Every resource here already points to you."
      >
        {link ? (
          <CopyField value={link} label="Referral link" />
        ) : (
          <p className="fj-body-sm">Your link is being set up. Check back soon.</p>
        )}
      </AppSection>

      <AppSection
        title="Copy you can use"
        description="Edit freely. Keep the claims honest: it is easier to sell."
      >
        {snippets.length === 0 ? (
          <p className="fj-body-sm">Copy appears once your link is ready.</p>
        ) : (
          <div className="fj-snippet-list">
            {snippets.map((s) => (
              <CopySnippet key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        )}
      </AppSection>

      <AppSection
        title="Brand assets"
        description="Logos and images for your site and posts."
      >
        {creatives.length === 0 ? (
          <p className="fj-body-sm">
            Downloadable assets are on the way. For now, the copy above and your
            link are all you need to start.
          </p>
        ) : (
          <ul className="fj-affiliate__linklist">
            {creatives.map((c) => (
              <li key={c.id} className="fj-affiliate__linkrow">
                <span className="fj-affiliate__linkcode">{c.title}</span>
                <span className="fj-affiliate__linkdest">
                  {[c.kind, c.dimensions, c.intendedUse]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AppSection>
    </>
  );
}
