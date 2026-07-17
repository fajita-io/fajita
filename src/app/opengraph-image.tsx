import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Fajita. Know when your software gets too hot.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph image rendered from the generated brand template
 * (public/brand/social/og-template.svg) so social previews always match
 * the exported asset system. PNG output for platform compatibility.
 */
export default async function OpenGraphImage() {
  const svg = await readFile(
    path.join(process.cwd(), "public", "brand", "social", "og-template.svg"),
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
