/**
 * Organic marketing attribution boundaries (Phase 15).
 *
 * Phase 12 affiliate attribution remains authoritative for commissions.
 * Organic discovery and assistance are separate reporting dimensions.
 * Do not double-count one conversion as two revenue sources.
 */

export const ORGANIC_ATTRIBUTION_WINDOW_DAYS = 30;

export type OrganicTouchKind =
  | "organic-originated"
  | "organic-assisted"
  | "tool-assisted"
  | "comparison-assisted"
  | "direct"
  | "affiliate-attributed"
  | "unknown";

export interface AssistedConversionDefinition {
  id: OrganicTouchKind;
  label: string;
  definition: string;
}

export const ASSISTED_CONVERSION_DEFINITIONS: AssistedConversionDefinition[] = [
  {
    id: "organic-originated",
    label: "Organic-originated signup",
    definition:
      "The first attributable external session originated from unpaid search and led to signup within the approved marketing-attribution window.",
  },
  {
    id: "organic-assisted",
    label: "Organic-assisted signup",
    definition:
      "An unpaid-search content session occurred before signup but was not the first attributable source.",
  },
  {
    id: "tool-assisted",
    label: "Tool-assisted signup",
    definition: "A free-tool session occurred before signup.",
  },
  {
    id: "comparison-assisted",
    label: "Comparison-assisted signup",
    definition: "A comparison page session occurred before signup.",
  },
  {
    id: "affiliate-attributed",
    label: "Affiliate attributed",
    definition:
      "Phase 12 referral attribution locked a commission-eligible affiliate source. Organic assistance may still be recorded for marketing reporting but does not replace affiliate commission attribution.",
  },
];

export function revenueReportingDimensions(): string[] {
  return [
    "organic-first-touch",
    "organic-assisted",
    "affiliate-attributed",
    "direct",
    "unknown",
  ];
}
