import { AppsumoCanvas } from "./canvas";

export function WordmarkScene() {
  return (
    <AppsumoCanvas>
      <div className="appsumo-wordmark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logos/fajita-logo-horizontal.svg"
          alt="Fajita wordmark"
          width={520}
          height={120}
        />
      </div>
    </AppsumoCanvas>
  );
}
