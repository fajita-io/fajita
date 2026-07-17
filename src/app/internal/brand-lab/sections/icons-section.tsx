import { BrandIcon, brandIconNames } from "@/components/design-system/icons";
import { StatusIcon } from "@/components/design-system/status/status-icon";
import { statusSpecs, type OperationalStatus } from "@/components/design-system/status/status";

import { LabGrid, LabSection, LabSpecimen } from "./lab-ui";

const statuses = Object.keys(statusSpecs) as OperationalStatus[];

export function IconsSection() {
  return (
    <LabSection
      id="icons"
      title="Iconography"
      note="Two proprietary families sharing the logo's monoline construction: concept icons (20 grid, 1.75 stroke) for monitoring ideas, and status icons (16 grid, 2 stroke) where every state has a distinct shape so color is never the only signal. Construction rules in docs/brand/fajita-iconography.md."
    >
      <h3 className="fj-heading-3" style={{ marginBottom: "var(--space-4)" }}>Concept icons</h3>
      <LabGrid min="9rem">
        {brandIconNames.map((n) => (
          <LabSpecimen key={n} label={n}>
            <BrandIcon name={n} size={28} />
          </LabSpecimen>
        ))}
      </LabGrid>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        Status icons (shape + color)
      </h3>
      <LabGrid min="9rem">
        {statuses.map((s) => (
          <LabSpecimen key={s} label={statusSpecs[s].label}>
            <StatusIcon status={s} size={28} labelled />
          </LabSpecimen>
        ))}
      </LabGrid>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        Grayscale test (shapes must still differentiate)
      </h3>
      <LabGrid min="9rem">
        {statuses.map((s) => (
          <LabSpecimen key={s} label={statusSpecs[s].label} style={{ filter: "grayscale(1)" }}>
            <StatusIcon status={s} size={28} labelled />
          </LabSpecimen>
        ))}
      </LabGrid>
    </LabSection>
  );
}
