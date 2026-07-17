import Link from "next/link";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";
import { getTerm, publicTerms } from "@/lib/glossary/registry";

export const metadata = {
  title: "Glossary lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FIXTURES = [
  "uptime-monitoring",
  "api-monitoring",
  "status-page",
  "incident-verification",
  "heartbeat-monitoring",
  "ssl-certificate-monitoring",
  "webhook-signature",
  "mean-time-to-recovery",
  "alert-routing",
  "scheduled-maintenance",
  "hmac",
  "service-level-agreement",
];

export default async function GlossaryLabPage() {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1>Glossary lab</h1>
      <p>Fixture links for visual and functional QA. No customer data.</p>
      <ul>
        <li>
          <Link href="/glossary">Index</Link>
        </li>
        <li>
          <Link href="/glossary/category/monitoring">Category: Monitoring</Link>
        </li>
        <li>
          <Link href="/glossary/letter/u">Letter U</Link>
        </li>
        <li>
          <Link href="/glossary/search">Search</Link>
        </li>
        <li>
          <Link href="/glossary/updates">Updates</Link>
        </li>
        <li>
          <Link href="/glossary/manifest.json">Manifest</Link>
        </li>
        <li>
          <Link href="/glossary/raw/uptime-monitoring">Raw: uptime monitoring</Link>
        </li>
        <li>
          <Link href="/glossary/mttr">Redirect: MTTR</Link>
        </li>
        <li>
          <Link href="/glossary/old-uptime-checker">Deprecated alias</Link>
        </li>
      </ul>
      <h2>Fixture terms</h2>
      <ul>
        {FIXTURES.map((slug) => {
          const term = getTerm(slug);
          return (
            <li key={slug}>
              <Link href={`/glossary/${slug}`}>
                {term?.meta.term ?? slug}
              </Link>
            </li>
          );
        })}
      </ul>
      <p>Published term count: {publicTerms().length}</p>
    </main>
  );
}
