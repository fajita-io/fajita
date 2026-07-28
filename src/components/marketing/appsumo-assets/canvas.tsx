import type { ReactNode } from "react";

export function AppsumoCanvas({
  children,
  dark = false,
  id = "appsumo-canvas",
}: {
  children: ReactNode;
  dark?: boolean;
  id?: string;
}) {
  return (
    <div className="appsumo-export-page">
      <div
        id={id}
        className={`appsumo-canvas${dark ? " appsumo-canvas--dark" : ""}`}
        data-appsumo-ready="true"
      >
        <div className="appsumo-canvas__inner">{children}</div>
      </div>
    </div>
  );
}
