import { h2, ol, p, table, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

export const certificateExpirationAlertTiming = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-cert-expiration-alert-timing",
    contentType: "article",
    slug: "how-early-should-you-alert-on-certificate-expiration",
    title: "How Early Should You Alert on Certificate Expiration?",
    description:
      "Alert on TLS certificate expiration with enough lead time to renew, validate, and deploy without waking people at 2 a.m. for a thirty-day warning.",
    articleType: "technical-tutorial",
    category: "ssl-dns",
    topicCluster: "ssl-dns",
    primaryQuery: "how early alert certificate expiration",
    secondaryQueries: [
      "ssl certificate expiration monitoring",
      "tls cert expiry alert threshold",
    ],
    searchIntent: "how-to",
    audience: "Teams responsible for production TLS",
    funnelStage: "education",
    readingMinutes: 7,
    thesis:
      "Expiration alerts should fire when you still have business days to fix the issue, not when the cert already expired. Layer thresholds at thirty, fourteen, and seven days for most SaaS products.",
    originalContribution:
      "30/14/7/1 day TLS expiration alert ladder with operational follow-up actions.",
    relatedContent: ["why-valid-certificate-can-still-fail"],
    relatedDocs: [{ href: "/docs/monitors/ssl-monitoring", label: "SSL monitoring" }],
    relatedGlossary: ["ssl-certificate-monitoring", "certificate-expiration"],
    relatedTools: [],
    relatedComparisons: [],
    productCta: "start-monitoring",
  },
  body: [
    p(
      "Certificate expiration incidents are embarrassing because they are predictable. The fix is not checking once. The fix is alerting early enough that renewal fits normal work, not an emergency deploy during a holiday.",
    ),

    h2("Recommended alert ladder"),
    table(
      ["Days remaining", "Purpose"],
      [
        ["30 days", "Create renewal ticket, verify auto-renew is enabled"],
        ["14 days", "Confirm new cert is issued and staged"],
        ["7 days", "Page if production still serves old expiry"],
        ["1 day", "Critical page to on-call with deploy authority"],
      ],
    ),
    p(
      "Adjust shorter if your CA or DNS validation routinely takes multiple days. Adjust longer if you manage hundreds of certs manually.",
    ),

    h2("Separate warning from outage"),
    ul([
      "Expiration warning is not the same as TLS handshake failure",
      "Monitor the served certificate on the public hostname customers use",
      "Track both apex and www if both serve traffic",
      "Include status page custom domains in the same program",
    ]),

    h2("Operational habits that prevent surprises"),
    ol([
      "Prefer automated ACME renewal where possible",
      "Document who can approve DNS validation records",
      "Test staging deploy after every renewal",
      "Keep a runbook link in the alert message",
    ]),
    p(
      "When an alert fires at thirty days, someone should be able to answer whether auto-renew is on and which provider issues the cert. If that answer is unclear, fix ownership before the seven day alert.",
    ),
    p(
      "Document the renewal owner in the same place you document on-call rotation. Certificate incidents happen on weekends because expiry dates ignore business hours.",
    ),

    h2("Testing alerts without waiting a month"),
    p(
      "Create a staging hostname with a short-lived test certificate or use your provider's sandbox to verify alerts reach the right channel. An untested expiration monitor is just calendar hope.",
    ),
  ],
});
