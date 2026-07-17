import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { isPlatformAdmin } from "@/lib/auth/context";
import { listKnowledgeSources } from "@/lib/support/knowledge/registry";

export const metadata: Metadata = {
  title: "Support knowledge",
  robots: { index: false, follow: false },
};

export default async function SupportKnowledgePage() {
  const admin = await isPlatformAdmin();
  if (!admin) redirect("/app");

  const sources = listKnowledgeSources().slice(0, 100);

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1>Support knowledge</h1>
      <p>
        Approved sources used by Ask Fajita. Pamphlet knowledge sync remains
        unavailable until a verified provider API exists.
      </p>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Authority</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.sourceId}>
              <td>{s.title}</td>
              <td>{s.sourceType}</td>
              <td>{s.authorityLevel}</td>
              <td>
                <a href={s.canonicalUrl}>{s.canonicalUrl}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PoweredByPamphlet />
    </main>
  );
}
