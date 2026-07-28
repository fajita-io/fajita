import { AppsumoCanvas } from "./canvas";
import { demoOrg } from "./demo-data";

function SlackMessage({
  time,
  subject,
  summary,
  fields,
  recovered = false,
}: {
  time: string;
  subject: string;
  summary: string;
  fields: Array<{ label: string; value: string }>;
  recovered?: boolean;
}) {
  return (
    <div className="appsumo-slack__msg">
      <div className={`appsumo-slack__avatar${recovered ? " appsumo-slack__avatar--ok" : ""}`}>
        F
      </div>
      <div>
        <div className="appsumo-slack__meta">
          <span className="appsumo-slack__name">Fajita</span>
          <span className="appsumo-slack__app-badge">APP</span>
          <span className="appsumo-slack__time">{time}</span>
        </div>
        <div className={`appsumo-slack__card${recovered ? " appsumo-slack__card--ok" : ""}`}>
          <div className="appsumo-slack__card-head">{subject}</div>
          <div className="appsumo-slack__card-body">{summary}</div>
          <div className="appsumo-slack__fields">
            {fields.map((field) => (
              <div key={field.label}>
                <div className="appsumo-slack__field-label">{field.label}</div>
                <div>{field.value}</div>
              </div>
            ))}
          </div>
          <span className="appsumo-slack__btn">Open in Fajita</span>
        </div>
      </div>
    </div>
  );
}

export function SlackAlertsScene() {
  return (
    <AppsumoCanvas>
      <div className="appsumo-slack">
        <aside className="appsumo-slack__sidebar">
          <div className="appsumo-slack__workspace">{demoOrg.name}</div>
          <div className="appsumo-slack__channel"># ops-alerts</div>
        </aside>
        <div className="appsumo-slack__main">
          <header className="appsumo-slack__header"># ops-alerts</header>
          <div className="appsumo-slack__feed">
            <SlackMessage
              time="9:42 AM"
              subject="[Major] Checkout API"
              summary="Checkout API failed verification on two consecutive checks from us-east and eu-west."
              fields={[
                { label: "State", value: "Down" },
                { label: "Host", value: "api.genius.ly" },
                { label: "Opened", value: "2026-07-27 09:41 UTC" },
                { label: "Verification", value: "Confirmed" },
              ]}
            />
            <SlackMessage
              time="9:58 AM"
              subject="[Resolved] Checkout API is operational"
              summary="Checkout API has recovered. Checks are passing again from all regions."
              fields={[
                { label: "State", value: "Operational" },
                { label: "Host", value: "api.genius.ly" },
                { label: "Resolved", value: "2026-07-27 09:57 UTC" },
                { label: "Duration", value: "16 minutes" },
              ]}
              recovered
            />
          </div>
        </div>
      </div>
    </AppsumoCanvas>
  );
}
