import { h2, p, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const REVIEWED = "2026-08-26";
const PRODUCT_VERSION = "2026.08";

export const openSourcePages: DocPage[] = [
  defineDoc({
    meta: {
      slug: "open-source/architecture",
      title: "Open-source architecture",
      description:
        "How Fajita monitoring runs: scheduler, workers, verification, incidents, notifications, and status pages over PostgreSQL.",
      category: "open-source",
      model: "learn",
      pageType: "overview",
      order: 0,
      difficulty: "core",
      estimatedTime: "6 min",
      productArea: ["open-source"],
      keywords: ["architecture", "open source", "workers", "verification"],
      relatedPages: ["self-hosting/quickstart", "incidents/verification"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
      searchBoost: 2,
    },
    body: [
      p(
        "Fajita uses one monitoring codebase for self-hosted and Cloud deployments. The operational difference is who runs workers, databases, and mail infrastructure.",
      ),
      h2("Core flow"),
      p(
        "Scheduler → Workers → Verification → Incident engine → Notifications → Status page, backed by PostgreSQL.",
      ),
      h2("Verification"),
      p(
        "Failed checks enter verification before incidents open. This is the primary behavioral difference from simple ping monitors.",
      ),
    ],
  }),

  defineDoc({
    meta: {
      slug: "open-source/contributing",
      title: "Contributing",
      description:
        "How to contribute to Fajita: issues, pull requests, code of conduct, and where to start.",
      category: "open-source",
      model: "reference",
      pageType: "reference",
      order: 1,
      difficulty: "intro",
      estimatedTime: "4 min",
      productArea: ["open-source"],
      keywords: ["contributing", "open source", "github"],
      relatedPages: ["open-source/license", "open-source/roadmap"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p(
        "Contributions happen through GitHub. Read CONTRIBUTING.md in the repository before opening a pull request.",
      ),
      ul([
        "Bug reports through GitHub Issues with reproduction steps",
        "Documentation fixes welcome without a prior issue",
        "Feature work should start with an issue for alignment",
        "Security reports follow SECURITY.md, not public issues",
      ]),
    ],
  }),

  defineDoc({
    meta: {
      slug: "open-source/roadmap",
      title: "Roadmap",
      description:
        "Where Fajita open-source development is headed. Source of truth lives in the repository ROADMAP.md.",
      category: "open-source",
      model: "reference",
      pageType: "reference",
      order: 2,
      difficulty: "intro",
      estimatedTime: "3 min",
      productArea: ["open-source"],
      keywords: ["roadmap", "open source"],
      relatedPages: ["open-source/changelog"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["product"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p(
        "The canonical roadmap lives in ROADMAP.md in the GitHub repository. It uses Now / Next / Later framing without fixed dates.",
      ),
      p("See also the public [roadmap page](/roadmap) for customer-facing product direction."),
    ],
  }),

  defineDoc({
    meta: {
      slug: "open-source/changelog",
      title: "Changelog",
      description:
        "Release history for the Fajita open-source project. Canonical file: CHANGELOG.md in the repository.",
      category: "open-source",
      model: "reference",
      pageType: "reference",
      order: 3,
      difficulty: "intro",
      estimatedTime: "2 min",
      productArea: ["open-source"],
      keywords: ["changelog", "releases", "open source"],
      relatedPages: ["open-source/roadmap", "self-hosting/upgrades"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p(
        "Release notes are maintained in CHANGELOG.md in the repository. The marketing [changelog page](/changelog) covers product-facing updates.",
      ),
    ],
  }),

  defineDoc({
    meta: {
      slug: "open-source/license",
      title: "License",
      description:
        "Fajita is licensed under AGPL-3.0. What that means for self-hosting, modification, and network use.",
      category: "open-source",
      model: "reference",
      pageType: "policy",
      order: 4,
      difficulty: "intro",
      estimatedTime: "3 min",
      productArea: ["open-source"],
      keywords: ["license", "agpl", "open source"],
      relatedPages: ["open-source/contributing"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["legal"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p(
        "Fajita is licensed under GNU Affero General Public License v3.0 (AGPL-3.0). Read LICENSE in the repository for the full text.",
      ),
      p(
        "Trademark use is governed separately. See TRADEMARKS.md in the repository if you distribute a modified version or reference the Fajita name in a product.",
      ),
    ],
  }),
];
