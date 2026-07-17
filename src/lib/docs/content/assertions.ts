import { callout, code, h2, p, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const base = {
  category: "assertions" as const,
  lastReviewedAt: "2026-07-17",
  owner: "docs-monitoring",
  reviewers: ["engineering", "product"],
  productVersion: "2026.07",
};

export const assertionsPages: DocPage[] = [
  defineDoc({
    meta: {
      ...base,
      slug: "assertions/overview",
      title: "Assertions",
      description:
        "Assertions decide whether a response is healthy. The types Fajita supports and how severity works.",
      model: "learn",
      pageType: "concept",
      order: 0,
      productArea: ["assertions"],
      keywords: ["assertion", "assert", "check response", "pass", "fail", "validation"],
      relatedPages: ["assertions/json-path", "assertions/keyword", "assertions/critical-vs-degrading"],
      searchBoost: 1,
    },
    body: [
      p("An assertion is a rule a response must satisfy. A check succeeds only when every assertion passes."),
      h2("Supported assertions"),
      table(
        ["Assertion", "Checks"],
        [
          ["Status code", "The response status is expected"],
          ["Response time", "The response arrived under a threshold"],
          ["Keyword", "The body contains (or does not contain) text"],
          ["Header equals", "A response header has an expected value"],
          ["JSON path", "A value inside a JSON body matches"],
          ["TLS", "Certificate validity, hostname, and expiry (SSL monitors)"],
        ],
      ),
      p("Each assertion page includes a configuration example, a passing result, a failing result, and troubleshooting."),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "assertions/keyword",
      title: "Keyword assertions",
      description: "Require or forbid text in a response body, with control over case sensitivity.",
      model: "build",
      pageType: "reference",
      order: 1,
      productArea: ["assertions"],
      keywords: ["keyword", "body contains", "text", "substring", "case sensitive"],
      relatedPages: ["assertions/json-path", "troubleshooting/json-assertion"],
    },
    body: [
      h2("Configuration"),
      ul([
        "Required keyword: the body must contain this text.",
        "Forbidden keyword: the body must not contain this text.",
        "Case sensitivity: choose whether matching respects case.",
      ]),
      h2("Passing result"),
      p("A monitor with a required keyword `\"status\":\"ok\"` passes when that exact text is present in the body."),
      code("json", '{ "status": "ok" }', "Body that passes a required-keyword check"),
      h2("Failing result"),
      p("If the required text is absent, or a forbidden keyword appears, the check fails and, once verified, opens an incident."),
      callout("note", [
        p("Keyword matching runs on the response body up to a size limit. For structured data, prefer a JSON path assertion."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "assertions/json-path",
      title: "JSON path assertions",
      description:
        "Check a value inside a JSON response: existence, equality, and numeric comparison, with clear failure behavior.",
      model: "build",
      pageType: "reference",
      order: 2,
      productArea: ["assertions"],
      keywords: ["json", "json path", "jsonpath", "field", "value", "number", "api"],
      relatedPages: ["monitors/api-monitoring", "troubleshooting/json-assertion"],
      searchBoost: 2,
    },
    body: [
      h2("Configuration"),
      p("Point a JSON path at a field in the response body and choose how to compare it."),
      table(
        ["Operator", "Passes when"],
        [
          ["Path exists", "The field is present"],
          ["Path does not exist", "The field is absent"],
          ["Equals", "The value equals the expected value"],
          ["Number at least / at most", "A numeric value is within bounds"],
        ],
      ),
      h2("Example"),
      code("json", '{\n  "status": "ok",\n  "queue": { "depth": 3 }\n}', "Response body"),
      p("A path of `queue.depth` with `number at most 100` passes for this response."),
      h2("Failure behavior"),
      ul([
        "Missing path: the assertion fails when it expected the field to exist.",
        "Type mismatch: comparing a number operator against text fails.",
        "Invalid JSON: if the body is not JSON, JSON assertions fail.",
      ]),
      callout("tip", [
        p("If a JSON assertion fails unexpectedly, run a manual test and inspect the raw body. See [JSON assertion failed](/docs/troubleshooting/json-assertion)."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "assertions/critical-vs-degrading",
      title: "Critical vs degrading",
      description: "How assertion outcomes map to a down state or a degraded state.",
      model: "learn",
      pageType: "concept",
      order: 3,
      productArea: ["assertions", "incidents"],
      keywords: ["critical", "degraded", "severity", "response time", "threshold"],
      relatedPages: ["incidents/degraded-vs-down"],
    },
    body: [
      p("Not every failed expectation is a full outage. Fajita distinguishes degraded from down."),
      table(
        ["Signal", "Typical outcome"],
        [
          ["Request fails or a required assertion fails", "Down, after verification"],
          ["Response time over threshold but request succeeds", "Degraded"],
        ],
      ),
      p("See [Degraded vs down](/docs/incidents/degraded-vs-down) for how these become incident severities."),
    ],
  }),
];
