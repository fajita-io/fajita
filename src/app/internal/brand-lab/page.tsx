import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { ThermalStackController } from "@/components/brand/thermal-stack/state-controller";
import { ThermalStackStatic } from "@/components/brand/thermal-stack/thermal-stack";
import { ThemeToggle } from "@/components/design-system/theme-toggle";

import { ColorSection } from "./sections/color-section";
import { ComponentsSection, StatusSection } from "./sections/components-section";
import { EmailSection } from "./sections/email-proto";
import { IconsSection } from "./sections/icons-section";
import { LabSection } from "./sections/lab-ui";
import { LogoExplorationsSection, LogoSystemSection } from "./sections/logo-section";
import { MotionSection } from "./sections/motion-section";
import { SocialSection } from "./sections/social-section";
import { SpaceSection } from "./sections/space-section";
import { StatusPageSection } from "./sections/status-page-proto";
import { TypeSection } from "./sections/type-section";

const toc = [
  ["strategy", "Strategy"],
  ["logo-explorations", "Logo territories"],
  ["logo-system", "Logo system"],
  ["color", "Color"],
  ["typography", "Typography"],
  ["space", "Space"],
  ["icons", "Icons"],
  ["thermal-stack", "Thermal Stack"],
  ["motion", "Motion"],
  ["status", "Status"],
  ["components", "Components"],
  ["status-page", "Status page"],
  ["email", "Email"],
  ["social", "Social assets"],
  ["accessibility", "Accessibility"],
];

export default function BrandLabPage() {
  return (
    <div className="fj-container" style={{ paddingBlock: "var(--space-8)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <FajitaLogo size={24} />
        <ThemeToggle />
      </header>

      <div style={{ marginTop: "var(--space-10)" }}>
        <p className="fj-eyebrow">Internal · Brand Lab · Phase 1</p>
        <h1 className="fj-display-2" style={{ marginTop: "var(--space-3)" }}>
          The Fajita brand world
        </h1>
        <p className="fj-body-lg" style={{ marginTop: "var(--space-4)", maxWidth: "44rem" }}>
          Identity, tokens, motion, and asset foundations for every later
          phase. This route is development-only, never indexed, and never
          linked from customer surfaces.
        </p>
        <nav aria-label="Sections" style={{ marginTop: "var(--space-6)" }}>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-2)",
              margin: 0,
              padding: 0,
            }}
          >
            {toc.map(([id, label]) => (
              <li key={id}>
                <a
                  className="fj-chip fj-interactive"
                  href={`#${id}`}
                  style={{ textDecoration: "none" }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <LabSection
        id="strategy"
        title="Strategy in one screen"
        note="Full documents: docs/brand/fajita-brand-strategy.md and fajita-verbal-identity.md."
      >
        <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: "52rem" }}>
          <p className="fj-heading-2" style={{ margin: 0 }}>
            Know when your software gets too hot.
          </p>
          <p className="fj-body">
            For founders and small software teams who answer for their own
            uptime, Fajita is uptime-monitoring software that catches trouble
            while it is still warming up, unlike enterprise observability
            suites and bare-bones ping checkers, because it watches websites,
            APIs, certificates, and cron jobs together, verifies before it
            alerts, and publishes status pages customers actually trust.
          </p>
          <p className="fj-body-sm">
            Archetype: the Guardian, with the Jester on a short leash (90/10,
            and 0 during incidents). Central metaphor: controlled heat under
            constant watch. The ember dot is the observer; it appears in the
            mark, the wordmark&apos;s j, and the Thermal Stack. Never a restaurant,
            never a mascot, never a food joke in an operational surface.
          </p>
        </div>
      </LabSection>

      <LogoExplorationsSection />
      <LogoSystemSection />
      <ColorSection />
      <TypeSection />
      <SpaceSection />
      <IconsSection />

      <LabSection
        id="thermal-stack"
        title="The Thermal Stack"
        note="Signature animated brand object: service nodes feeding a controlled heat surface, the ember dot watching above. Pure CSS animation, server-rendered SVG, reduced-motion safe. Components in src/components/brand/thermal-stack/."
      >
        <ThermalStackController />
        <h3 className="fj-heading-3" style={{ margin: "var(--space-8) 0 var(--space-4)" }}>
          Static fallback and simplified mobile composition
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(20rem, 100%), 1fr))",
            gap: "var(--space-6)",
            alignItems: "start",
          }}
        >
          <figure style={{ margin: 0 }}>
            <ThermalStackStatic state="degraded" />
            <figcaption className="fj-caption" style={{ marginTop: "var(--space-2)" }}>
              Static (no motion), degraded
            </figcaption>
          </figure>
          <figure style={{ margin: 0, maxWidth: "22rem" }}>
            <ThermalStackStatic state="down" simplified />
            <figcaption className="fj-caption" style={{ marginTop: "var(--space-2)" }}>
              Simplified mobile composition, down
            </figcaption>
          </figure>
        </div>
      </LabSection>

      <MotionSection />
      <StatusSection />
      <ComponentsSection />
      <StatusPageSection />
      <EmailSection />
      <SocialSection />

      <LabSection
        id="accessibility"
        title="Accessibility notes"
        note="Accessibility is a design material here, not an audit step."
      >
        <ul className="fj-body-sm" style={{ maxWidth: "52rem", lineHeight: 1.8, paddingLeft: "1.25rem" }}>
          <li>Status is never color-only: every state pairs a distinct icon shape with a text label; the uptime strip carries a hidden per-day text alternative.</li>
          <li>All text tokens meet WCAG AA on their approved surfaces; most reach AAA (see contrast table above, values measured, not estimated).</li>
          <li>Focus is a 2px ember ring with 2px offset on every interactive element, in both themes.</li>
          <li>prefers-reduced-motion collapses all non-essential animation globally (motion.css) and stops the ember pulse, signal travel, and journey autoplay.</li>
          <li>Buttons and inputs keep a 44px minimum target. Tooltips open on focus as well as hover.</li>
          <li>The Thermal Stack always renders an aria-label and visible caption; meaning never lives in animation alone.</li>
          <li>Grayscale icon test above verifies color-vision safety; the amber/ember/pepper ramp is also distinguished by lightness steps.</li>
          <li>Theme honors system preference, persists explicit choice, and initializes pre-paint (no flash, no hydration mismatch).</li>
        </ul>
      </LabSection>

      <footer style={{ paddingBlock: "var(--space-8)" }}>
        <p className="fj-caption">
          Fajita Brand Lab · Phase 1 · governance in docs/brand/fajita-brand-governance.md
        </p>
      </footer>
    </div>
  );
}
