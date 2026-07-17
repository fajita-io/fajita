import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  OpsBreadcrumbs,
  OpsLinkButton,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import {
  gatesByDomain,
  LAUNCH_BLOCKERS,
  type ReadinessDomain,
} from "@/lib/platform/readiness";

export const dynamic = "force-dynamic";

const DOMAINS: ReadinessDomain[] = [
  "security",
  "privacy",
  "legal",
  "billing",
  "reliability",
  "performance",
  "accessibility",
  "operations",
  "launch",
  "transfer",
  "product",
];

export function generateStaticParams() {
  return DOMAINS.map((domain) => ({ domain }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  return {
    title: `Readiness · ${domain}`,
    robots: { index: false, follow: false },
  };
}

export default async function ReadinessDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: raw } = await params;
  if (!DOMAINS.includes(raw as ReadinessDomain)) notFound();
  const domain = raw as ReadinessDomain;
  const gates = gatesByDomain(domain);
  const blockers = LAUNCH_BLOCKERS.filter((b) => b.domain === domain);

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { href: "/internal/readiness", label: "Readiness" },
          { label: domain },
        ]}
      />
      <OpsPageHeader
        title={`Readiness · ${domain}`}
        deck="Domain gates with evidence. Statuses are registry truth, not marketing."
        actions={
          <>
            <OpsLinkButton href="/internal/readiness">All domains</OpsLinkButton>
            <OpsLinkButton href="/internal/launch">Launch control</OpsLinkButton>
          </>
        }
      />

      <OpsPanel title="Gates">
        {gates.length === 0 ? (
          <p className="fj-ops-empty">No gates in this domain.</p>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Last tested</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {gates.map((g) => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td>{g.title}</td>
                  <td>{g.severity}</td>
                  <td>{g.status.replaceAll("_", " ")}</td>
                  <td>{g.owner}</td>
                  <td>{g.lastTested ?? "—"}</td>
                  <td>{g.relatedIssue ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>

      <OpsPanel title="Related blockers">
        {blockers.length === 0 ? (
          <p className="fj-ops-empty">No blockers tagged to this domain.</p>
        ) : (
          <ul className="fj-ops-list">
            {blockers.map((b) => (
              <li key={b.id}>
                <strong>{b.id}</strong> [{b.severity}] {b.title} · {b.status}
              </li>
            ))}
          </ul>
        )}
        <p className="fj-ops-empty">
          Evidence docs:{" "}
          <Link href="/internal/readiness">scorecard home</Link>
        </p>
      </OpsPanel>
    </>
  );
}
