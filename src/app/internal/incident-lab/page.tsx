import { IncidentLabClient } from "./incident-lab-client";

/**
 * Internal incident lab. Runs deterministic simulations of the incident state
 * machine using the pure evaluator (src/lib/incidents/state-machine.ts), which
 * mirrors the SQL runtime (app.evaluate_check_result). Everything here is
 * synthetic and clearly labeled. This surface exists to make the engine's
 * behavior legible: why an incident opens, why one failure does not, how
 * recovery confirms, how flapping is contained, and how maintenance suppresses.
 */
export default function IncidentLabPage() {
  return (
    <main
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "2.5rem 1.25rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.75rem",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Internal · Simulation only
        </p>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Incident lab</h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, maxWidth: "68ch" }}>
          Deterministic simulations of the incident engine. Each scenario feeds a
          synthetic sequence of finalized check results through the same
          transition rules the SQL evaluator applies at runtime. No real monitors
          are touched and nothing is written to the database.
        </p>
      </header>

      <IncidentLabClient />
    </main>
  );
}
