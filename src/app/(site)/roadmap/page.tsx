import type { Metadata } from "next";

import { buildMetadata } from "@/lib/site/metadata";
import { roadmapItems, roadmapStages } from "@/lib/site/roadmap";

export const metadata: Metadata = buildMetadata({
  title: "Roadmap",
  description:
    "Where Fajita is headed: core monitoring, alert channels, status pages, and what comes after. Direction, not delivery dates.",
  path: "/roadmap",
});

export default function RoadmapPage() {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            Roadmap
          </p>
          <h1 className="fj-display-2">Where this is going.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Direction, honestly stated. Priorities can change as we learn
            from early users, so treat this as intent rather than a
            contract. No dates, on purpose.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-roadmap">
            {roadmapStages.map((stage) => {
              const items = roadmapItems.filter((i) => i.stage === stage.id);
              if (items.length === 0) return null;
              return (
                <section key={stage.id} aria-label={stage.label}>
                  <div className="fj-roadmap__stage-head">
                    <h2 className="fj-heading-2">{stage.label}</h2>
                    <p className="fj-body-sm" style={{ margin: 0 }}>
                      {stage.note}
                    </p>
                  </div>
                  <ul className="fj-roadmap__items">
                    {items.map((item) => (
                      <li key={item.id}>
                        <h3 className="fj-heading-3">{item.title}</h3>
                        <p className="fj-body-sm" style={{ margin: 0 }}>
                          {item.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
