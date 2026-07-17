import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon rendered from the exported app-icon SVG. */
export default async function AppleIcon() {
  const svg = await readFile(
    path.join(process.cwd(), "public", "brand", "icons", "app-icon.svg"),
    "utf8",
  );
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <img
        src={dataUri}
        alt=""
        width={size.width}
        height={size.height}
        style={{ width: "100%", height: "100%" }}
      />
    ),
    size,
  );
}
