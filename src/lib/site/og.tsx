import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * Renders a pre-generated page OG template
 * (public/brand/social/pages/<slug>.svg, built by
 * scripts/generate-og-pages.ts) as a PNG for platform compatibility.
 */
export async function pageOgImage(slug: string): Promise<ImageResponse> {
  const svg = await readFile(
    path.join(process.cwd(), "public", "brand", "social", "pages", `${slug}.svg`),
    "utf8",
  );
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      /* eslint-disable-next-line @next/next/no-img-element -- ImageResponse
         renders with Satori; next/image does not exist in that context. */
      <img
        src={dataUri}
        alt=""
        width={ogSize.width}
        height={ogSize.height}
        style={{ width: "100%", height: "100%" }}
      />
    ),
    ogSize,
  );
}
