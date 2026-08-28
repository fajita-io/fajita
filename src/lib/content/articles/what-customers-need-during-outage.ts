import { h2, ol, p, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

export const whatCustomersNeedDuringOutage = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-customers-during-outage",
    contentType: "article",
    slug: "what-customers-need-during-an-outage",
    title: "What Customers Actually Need During an Outage",
    description:
      "During an outage customers need scope, timing honesty, and next steps. They do not need root cause theater or vague all-systems updates.",
    articleType: "incident-communication",
    category: "incident-response",
    topicCluster: "incident-communication",
    primaryQuery: "what to tell customers during outage",
    secondaryQueries: [
      "customer communication during downtime",
      "status page update during incident",
    ],
    searchIntent: "how-to",
    audience: "Founders writing their first public incident updates",
    funnelStage: "education",
    readingMinutes: 8,
    thesis:
      "Customers tolerate downtime better when you tell them what is broken, who is affected, what you are doing, and when you will speak again. Speculation and silence hurt more than admitting uncertainty.",
    originalContribution:
      "Four-fact first update contract for customer-facing incident communication.",
    relatedContent: ["write-useful-incident-update", "what-belongs-on-status-page"],
    relatedDocs: [
      { href: "/docs/incidents/timeline", label: "Incident timeline" },
      { href: "/docs/status-pages/create", label: "Create a status page" },
    ],
    relatedGlossary: ["incident-update", "status-page", "incident"],
    relatedTools: ["status-page-checklist"],
    relatedComparisons: [],
    productCta: "publish-status-page",
  },
  body: [
    p(
      "The first customer message during an outage is not a technical postmortem. It is a contract. You are promising to keep affected people oriented while work continues. Most frustration comes from guessing whether the product is broken for everyone or only for them.",
    ),

    h2("Four facts customers need immediately"),
    ol([
      "What is broken in plain language (login, exports, billing webhooks)",
      "Who is affected (all users, EU region, free tier only)",
      "What you are doing now (investigating, rolling back, waiting on a provider)",
      "When you will update again even if nothing changed",
    ]),
    p(
      "If you do not know root cause yet, say so. Unknown cause with clear impact beats a confident guess that changes twenty minutes later.",
    ),

    h2("What to leave out of the first update"),
    ul([
      "Stack traces or internal service names customers cannot act on",
      "Blame directed at a vendor before you verified their status page",
      "Promises about fix time you cannot defend",
      "Marketing language about how much you care without new information",
    ]),

    h2("Cadence beats perfection"),
    p(
      "Short updates on a schedule reduce support volume more than one long essay. Many teams post every thirty minutes during active customer impact, then hourly while monitoring. Subscribers should not need to refresh Twitter to learn you are still working.",
    ),
    p(
      "Each update should add one new fact or explicitly say nothing changed since the last post. Repeating the same sentence trains customers to ignore the page. Even no new information is useful when it includes the next check-in time.",
    ),

    h2("Close the loop honestly"),
    p(
      "Resolution updates should confirm what returned to normal and what you are still watching. If data was affected, say so with specifics or say investigation continues. Trust compounds when the last message is as precise as the first.",
    ),
    p(
      "Link to a brief postmortem when you have one. Customers forgive outages faster when the final update explains prevention steps in plain language, not when it disappears after a green banner returns.",
    ),
  ],
});
