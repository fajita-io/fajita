import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { FajitaMark } from "@/components/brand/logo/fajita-mark";
import { FajitaWordmark } from "@/components/brand/logo/fajita-wordmark";
import { logoTerritories } from "@/components/brand/logo/logo-territories";
import { FajitaPoweredBy } from "@/components/brand/powered-by/fajita-powered-by";

import { LabGrid, LabSection, LabSpecimen } from "./lab-ui";

export function LogoExplorationsSection() {
  return (
    <LabSection
      id="logo-explorations"
      title="Logo territories"
      note="Six conceptually distinct territories were explored before selection. Territory 4, the held pulse, was chosen: a heat spike inside a controlled boundary with the ember dot lifting off the peak. Full evaluation in docs/brand/fajita-logo-system.md. Rejected sketches are preserved here for provenance and must never ship."
    >
      <LabGrid min="16rem">
        {logoTerritories.map((t) => (
          <figure
            key={t.id}
            className="fj-card"
            style={{
              margin: 0,
              outline:
                t.verdict === "selected"
                  ? "2px solid var(--color-brand-ember)"
                  : undefined,
              outlineOffset: 2,
            }}
          >
            <t.Sketch size={72} />
            <figcaption style={{ marginTop: "var(--space-3)" }}>
              <p className="fj-heading-3" style={{ margin: 0 }}>
                {t.id}. {t.name}{" "}
                {t.verdict === "selected" ? (
                  <span className="fj-eyebrow">selected</span>
                ) : null}
              </p>
              <p className="fj-body-sm" style={{ marginTop: "var(--space-2)" }}>
                {t.concept}
              </p>
              <p className="fj-caption" style={{ marginTop: "var(--space-2)" }}>
                {t.verdict === "selected" ? "Why it won: " : "Why rejected: "}
                {t.reason}
              </p>
            </figcaption>
          </figure>
        ))}
      </LabGrid>
    </LabSection>
  );
}

export function LogoSystemSection() {
  return (
    <LabSection
      id="logo-system"
      title="Final logo system"
      note="The held pulse. Boundary radius 16/64 defines the brand radius token. The ember dot is the observer: it crowns the mark, dots the j in the wordmark, and pulses in the Thermal Stack. Clearspace: the boundary radius on all sides. Minimum sizes: mark 16px, horizontal lockup 96px wide."
    >
      <LabGrid min="16rem">
        <LabSpecimen label="Primary horizontal lockup">
          <FajitaLogo orientation="horizontal" size={30} />
        </LabSpecimen>
        <LabSpecimen label="Stacked lockup">
          <FajitaLogo orientation="stacked" size={24} />
        </LabSpecimen>
        <LabSpecimen label="Wordmark only">
          <FajitaWordmark height={40} />
        </LabSpecimen>
        <LabSpecimen label="Symbol only">
          <FajitaMark size={72} />
        </LabSpecimen>
        <LabSpecimen label="Dark background" dark>
          <FajitaLogo orientation="horizontal" size={30} tone="dark" />
        </LabSpecimen>
        <LabSpecimen label="Monochrome (single ink)">
          <span style={{ color: "var(--color-text-primary)" }}>
            <FajitaLogo orientation="horizontal" size={30} tone="mono" />
          </span>
        </LabSpecimen>
        <LabSpecimen label="Animated (ember pulse)">
          <FajitaMark size={72} animated />
        </LabSpecimen>
        <LabSpecimen label="Powered-by lockup">
          <FajitaPoweredBy />
        </LabSpecimen>
      </LabGrid>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        Sizing tests
      </h3>
      <LabGrid min="10rem">
        {[64, 48, 32, 24, 20, 16].map((s) => (
          <LabSpecimen key={s} label={`Mark at ${s}px`}>
            <FajitaMark size={s} />
          </LabSpecimen>
        ))}
      </LabGrid>

      <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
        In context
      </h3>
      <LabGrid min="16rem">
        <LabSpecimen label="Favicon / browser tab (16px tile)">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-background-inset)",
              fontSize: "var(--text-caption)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/icons/app-icon.svg" alt="" width={16} height={16} />
            Fajita · Monitors
          </span>
        </LabSpecimen>
        <LabSpecimen label="App icon / mobile home screen" dark>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icons/app-icon.svg" alt="Fajita app icon" width={88} height={88} style={{ borderRadius: 20 }} />
        </LabSpecimen>
        <LabSpecimen label="Social avatar (circle crop survives)" dark>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icons/social-avatar.svg" alt="Fajita social avatar" width={88} height={88} style={{ borderRadius: "50%" }} />
        </LabSpecimen>
        <LabSpecimen label="App sidebar header">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)" }}>
            <FajitaMark size={26} label="" />
            <FajitaWordmark height={18} />
          </span>
        </LabSpecimen>
      </LabGrid>
    </LabSection>
  );
}
