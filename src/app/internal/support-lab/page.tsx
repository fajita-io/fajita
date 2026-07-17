import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { isPlatformAdmin } from "@/lib/auth/context";
import { answerSupportQuestion } from "@/lib/support/decision-engine";
import { SUPPORT_FIXTURES } from "@/lib/support/fixtures/cases";
import { getPamphletHealth } from "@/lib/pamphlet/health";
import { isDevelopment } from "@/lib/env";

export const metadata: Metadata = {
  title: "Support lab",
  robots: { index: false, follow: false },
};

export default async function SupportLabPage() {
  const admin = await isPlatformAdmin();
  if (!admin && !isDevelopment) redirect("/app");

  const health = getPamphletHealth();
  const samples = await Promise.all(
    SUPPORT_FIXTURES.slice(0, 12).map(async (fixture) => {
      const result = await answerSupportQuestion({
        message: fixture.question,
        mode: fixture.mode,
      });
      return { fixture, result };
    }),
  );

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1>Support lab</h1>
      <p>
        Fixture-only Ask Fajita surface. No production customer conversations.
      </p>
      <p>
        Pamphlet health: <strong>{health.status}</strong>. {health.details}
      </p>
      <PoweredByPamphlet />
      <ol>
        {samples.map(({ fixture, result }) => (
          <li key={fixture.id} style={{ marginBottom: "1.5rem" }}>
            <h2>{fixture.id}</h2>
            <p>
              <strong>Q:</strong> {fixture.question}
            </p>
            <p>
              <strong>A:</strong> {result.answer.directAnswer}
            </p>
            <p>
              Confidence: {result.answer.confidence}. Intent:{" "}
              {result.answer.intent}. Handoff:{" "}
              {result.answer.offerHandoff ? "offered" : "no"}.
            </p>
            <ul>
              {result.answer.sources.map((s) => (
                <li key={s.sourceId}>
                  <a href={s.url}>{s.title}</a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <PoweredByPamphlet compact />
    </main>
  );
}
