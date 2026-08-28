import { h2, p, ul } from "@/lib/docs/blocks";

import { defineArticle } from "../types";
import { LAUNCH_REVIEWS } from "./_shared";

export const whyValidCertificateCanStillFail = defineArticle({
  meta: {
    ...LAUNCH_REVIEWS,
    id: "article-valid-cert-still-fails",
    contentType: "article",
    slug: "why-valid-certificate-can-still-fail",
    title: "Why a Valid Certificate Can Still Fail",
    description:
      "A certificate can be unexpired and still break TLS for customers. Hostname mismatch, incomplete chain, and stale DNS cause outages monitoring must catch.",
    articleType: "troubleshooting",
    category: "ssl-dns",
    topicCluster: "ssl-dns",
    primaryQuery: "valid ssl certificate still failing",
    secondaryQueries: [
      "tls handshake failure valid cert",
      "certificate hostname mismatch",
    ],
    searchIntent: "troubleshoot",
    audience: "Operators debugging HTTPS errors",
    funnelStage: "education",
    readingMinutes: 7,
    thesis:
      "Expiration date is one field on a certificate. Customers experience TLS success only when chain, hostname, and served config all match the URL they typed.",
    originalContribution:
      "Checklist separating expiration warnings from served-chain and hostname failures.",
    relatedContent: ["how-early-should-you-alert-on-certificate-expiration"],
    relatedDocs: [{ href: "/docs/monitors/ssl-monitoring", label: "SSL monitoring" }],
    relatedGlossary: ["ssl-certificate-monitoring", "certificate-expiration"],
    relatedTools: [],
    relatedComparisons: [],
    productCta: "start-monitoring",
  },
  body: [
    p(
      "Teams sometimes renew a certificate and still see browser errors. The new cert exists in the provider dashboard. Customers still get privacy warnings. That gap usually means the served configuration does not match what you renewed.",
    ),

    h2("Common causes beyond expiration"),
    ul([
      "Hostname mismatch: cert covers www.example.com but users hit example.com",
      "Incomplete chain: missing intermediate cert on the load balancer",
      "Wrong cert deployed to one edge node in a pool",
      "SNI or port mismatch on shared infrastructure",
      "Cloudflare or CDN still serving older edge cert",
    ]),

    h2("Why external checks matter"),
    p(
      "Internal openssl commands against localhost do not prove what a customer sees. External SSL monitors handshake the same hostname and port browsers use. They catch partial deploys and DNS splits that internal tooling misses.",
    ),
    p(
      "Run the same check from at least two perspectives if your product serves global customers. Regional DNS or CDN misconfiguration often shows up in one geography first.",
    ),

    h2("What to monitor together"),
    ul([
      "Certificate expiration on the public hostname",
      "HTTPS availability with full chain validation",
      "DNS resolution for apex and www",
      "Redirect behavior between http and https",
    ]),
    p(
      "Treat renewal as a deploy with verification, not a checkbox in a CA email. After every change, confirm the served cert serial matches the one you expect from outside your network.",
    ),
    p(
      "Keep a screenshot or openssl output from the public hostname in the change ticket. Future you will thank present you when a load balancer still serves last month's cert after a successful renewal dashboard message.",
    ),

    h2("When to page immediately"),
    p(
      "Expiration warnings can wait for business hours. Active TLS handshake failures on the customer hostname should not. Treat handshake errors as availability incidents with the same urgency as a 503 on login.",
    ),
    p(
      "Record which hostname and port failed in the alert title so responders do not debug the wrong certificate during a stressful rollout.",
    ),
  ],
});
