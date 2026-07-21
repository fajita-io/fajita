/**
 * Renders public/brand/icons/app-icon-square.svg to a square PNG (1024×1024).
 * Run: npx tsx scripts/export-app-icon-square-png.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const SIZE = 1024;
const svgPath = path.join(root, "public/brand/icons/app-icon-square.svg");
const pngPath = path.join(root, "public/brand/icons/app-icon-square.png");

async function main() {
  const svg = readFileSync(svgPath, "utf8");
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: #17130e; }
      svg { display: block; width: ${SIZE}px; height: ${SIZE}px; }
    </style>
  </head>
  <body>${svg}</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: "load" });
  const png = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: SIZE, height: SIZE },
    omitBackground: false,
  });
  await browser.close();

  writeFileSync(pngPath, png);
  console.log("wrote", path.relative(root, pngPath), `(${SIZE}×${SIZE})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
