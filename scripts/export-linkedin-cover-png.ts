/**
 * Renders public/brand/social/linkedin-cover.svg to PNG at LinkedIn spec (1128×191).
 * Run: npx tsx scripts/export-linkedin-cover-png.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const W = 1128;
const H = 191;
const svgPath = path.join(root, "public/brand/social/linkedin-cover.svg");
const pngPath = path.join(root, "public/brand/social/linkedin-cover.png");

async function main() {
  const svg = readFileSync(svgPath, "utf8");
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: #17130e; }
      svg { display: block; }
    </style>
  </head>
  <body>${svg}</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: "load" });
  const png = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: W, height: H },
    omitBackground: false,
  });
  await browser.close();

  writeFileSync(pngPath, png);
  console.log("wrote", path.relative(root, pngPath), `(${W}×${H})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
