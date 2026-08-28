import { ImageResponse } from "next/og";

import { OVERALL_STATE_LABEL } from "@/lib/status-pages/constants";
import { getPublicSnapshotByDomain } from "@/lib/status-pages/projection";

export const revalidate = 60;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Status";

const BG: Record<string, string> = {
  operational: "#16241a",
  degraded: "#2a2415",
  maintenance: "#16222e",
  partial_outage: "#2b2015",
  major_outage: "#2c1917",
};

const ACCENT: Record<string, string> = {
  operational: "#7bd167",
  degraded: "#e0b558",
  maintenance: "#7db0e6",
  partial_outage: "#e89158",
  major_outage: "#f0776a",
};

export default async function OgImage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const snapshot = await getPublicSnapshotByDomain(decodeURIComponent(host));
  const name = snapshot?.data.page.name ?? "Status";
  const overall = snapshot?.overallStatus ?? "operational";
  const label = OVERALL_STATE_LABEL[overall];
  const bg = BG[overall] ?? "#0b0d12";
  const accent = ACCENT[overall] ?? "#7bd167";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: bg,
          padding: "72px",
          color: "#f4f4f2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 600 }}>
          {name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: accent }} />
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.02em" }}>{label}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#b8b5af" }}>
          <span>Status</span>
          <span>Powered by Fajita</span>
        </div>
      </div>
    ),
    size,
  );
}
