#!/usr/bin/env tsx
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

async function exportSvg(opts: {
  svgRel: string;
  pngRel: string;
  width: number;
  height: number;
  iconSize: number;
  background?: string;
}): Promise<void> {
  const svgPath = join(root, "public", "brand", opts.svgRel);
  const pngPath = join(root, "public", "brand", opts.pngRel);
  const svg = readFileSync(svgPath, "utf8");
  mkdirSync(join(pngPath, ".."), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: opts.width, height: opts.height },
    });
    const sizedSvg = svg.replace(/<svg/, `<svg width="${opts.iconSize}" height="${opts.iconSize}"`);
    const bg = opts.background ?? "#17130e";
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:${bg};display:flex;align-items:center;justify-content:center;width:${opts.width}px;height:${opts.height}px;"><div id="asset">${sizedSvg}</div></body></html>`,
      { waitUntil: "networkidle" },
    );
    await page.screenshot({ path: pngPath, type: "png" });
    console.log("wrote", join("public/brand", opts.pngRel));
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  await exportSvg({
    svgRel: "icons/app-icon.svg",
    pngRel: "github/fajita-org-avatar.png",
    width: 1024,
    height: 1024,
    iconSize: 1024,
  });
  await exportSvg({
    svgRel: "icons/app-icon.svg",
    pngRel: "github/fajita-repo-social.png",
    width: 1280,
    height: 640,
    iconSize: 420,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
