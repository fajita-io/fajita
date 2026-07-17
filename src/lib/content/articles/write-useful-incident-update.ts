import { callout, h2, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

/** Original contribution: the FACT update template (Facts, Action, Cadence, Tone). */
export const writeUsefulIncidentUpdate = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-write-useful-incident-update",
    contentType: "article",
    slug: "write-useful-incident-update",
    title: "How to Write a Useful Incident Update",
    description:
      "Use the FACT template: facts customers can verify, action you are taking, cadence for the next update, and a calm tone. Templates you can paste under pressure.",
    articleType: "incident-communication",
    category: "incident-response",
    topicCluster: "incident-communication",
    primaryQuery: "how to write incident status update",
    secondaryQueries: [
      "status page update template",
      "incident communication guide",
      "public outage message",
    ],
    searchIntent: "how-to",
    audience: "Founders and support-minded engineers",
    funnelStage: "education",
    readingMinutes: 8,
    thesis:
      "Customers need verifiable facts, a clear action, a next-update time, and a calm tone. Speculation and silence both make outages worse. This guide gives a paste-ready template and examples.",
    featured: true,
    originalContribution:
      "FACT update template: Facts, Action, Cadence, Tone, with paste-ready first, progress, and resolution messages.",
    relatedContent: [
      "what-belongs-on-status-page",
      "minimum-reliability-stack-solo-saas",
    ],
    relatedDocs: [
      { href: "/docs/incidents/timeline", label: "Incident timeline" },
      { href: "/docs/status-pages/create", label: "Create a status page" },
    ],
    relatedGlossary: ["incident", "public-incident", "status-page"],
    relatedTools: ["status-page-checklist"],
    relatedComparisons: [],
    productCta: "publish-status-page",
  },
  body: [
    p(
      "Customers need four things in a public incident update: facts they can verify, the action you are taking, when you will speak again, and a tone that does not panic them. Speculation, silence, and marketing language all make outages worse. This guide gives a paste-ready template.",
    ),
    p(
      "Assumption: you have a status page or another channel customers already trust. Do not invent a new medium mid-incident.",
    ),

    h2("The FACT template"),
    ul([
      "Facts. What is broken in customer language. What still works. Timestamp in a clear timezone.",
      "Action. What you are doing now. Avoid promising a root cause you do not have.",
      "Cadence. When the next update lands, even if nothing changed.",
      "Tone. Short sentences. No blame. No jokes about downtime. No vague reassurance.",
    ]),

    h2("First update (within minutes)"),
    p(
      "Publish as soon as you know customers are affected, even if the cause is unknown.",
    ),
    callout("note", [
      p(
        "We are investigating reports that API requests are failing with timeouts. Sign-in and billing pages may be slow or unavailable. Dashboard read views appear unaffected. Next update by 14:30 UTC.",
      ),
    ]),

    h2("Progress update"),
    p(
      "Say what changed since the last message. If nothing changed, say that and keep the cadence.",
    ),
    callout("note", [
      p(
        "Investigation continues. We confirmed elevated error rates on the payments API beginning at 13:52 UTC. Checkout is degraded. We are failing closed on new charges while we roll forward a fix. Next update by 15:00 UTC.",
      ),
    ]),

    h2("Resolution update"),
    p(
      "State when service returned, what customers should retry, and whether a follow-up postmortem is coming. Do not claim perfection.",
    ),
    callout("note", [
      p(
        "The payments API recovered at 14:48 UTC. Error rates are back to normal. If a checkout failed during the window, retry the payment. We will publish a short summary of cause and follow-ups within two business days.",
      ),
    ]),

    h2("Internal notes versus public updates"),
    table(
      ["Keep internal", "Publish externally"],
      [
        ["Suspect commit hashes, vendor tickets", "Customer-visible impact"],
        ["Blame hypotheses", "Confirmed scope"],
        ["Raw error dumps", "Safe workaround if one exists"],
        ["Personal frustration", "Next update time"],
      ],
    ),

    h2("Cadence under pressure"),
    p(
      "For active customer impact, update every 30 to 60 minutes unless you promise a specific time. Missing a promised update without explanation destroys trust faster than a delayed fix. Related glossary: [incident](/glossary/incident), [public incident](/glossary/public-incident).",
    ),

    h2("When not to publish"),
    ul([
      "A brief blip that never left the verifying state and no customer reported impact",
      "A staging-only failure",
      "A security event that requires controlled disclosure (follow your security process instead)",
    ]),

    h2("Language that helps"),
    ul([
      "Started at 13:52 UTC",
      "Checkout is failing for some customers",
      "Next update by 15:00 UTC",
      "Retry the payment if it failed during the window",
    ]),
    p(
      "Language that usually hurts: forever words (always, never), blame, fake precision, and promises about root cause before you have one. If you do not know, say you are investigating.",
    ),

    h2("Practice once while calm"),
    p(
      "Write three draft updates for a fictional outage before you need them. Store them where on-call can find them. Pair with [What Should Go on a Public Status Page?](/blog/what-belongs-on-status-page) so components and language already match.",
    ),
    p(
      "When the real incident hits, you should be editing timestamps and impact, not inventing a voice. That is the whole point of the FACT template.",
    ),
  ],
});
