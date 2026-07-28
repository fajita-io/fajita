/**
 * Export AppSumo listing PNGs and zip them for upload.
 *
 * Usage:
 *   npm run appsumo:export              # all scenes
 *   npm run appsumo:export -- wordmark  # wordmark only
 *
 * Output: appsumo-assets/fajita-appsumo-listing.zip
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

import {
  APPSUMO_HTML_SCENE_LIST,
  APPSUMO_HTML_SCENES,
  type AppsumoHtmlSceneId,
} from "./appsumo-assets/scenes";

const root = process.cwd();
const outDir = path.join(root, "appsumo-assets");
const zipPath = path.join(outDir, "fajita-appsumo-listing.zip");
const DEFAULT_SIZE = { width: 1920, height: 1080 };

async function main() {
  const only = process.argv[2] as AppsumoHtmlSceneId | undefined;
  const scenes = only
    ? [APPSUMO_HTML_SCENES[only]]
    : APPSUMO_HTML_SCENE_LIST;

  if (only && !APPSUMO_HTML_SCENES[only]) {
    throw new Error(`Unknown scene "${only}". Use: ${Object.keys(APPSUMO_HTML_SCENES).join(", ")}`);
  }

  if (only) {
    mkdirSync(outDir, { recursive: true });
  } else {
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });
  }

  const altLines: string[] = [
    "# Fajita AppSumo listing image alt text",
    "# Product shots: 16:9 · 1920×1080 · PNG",
    "# Wordmark: 5:1 · 2000×400 · PNG",
    "",
  ];

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  try {
    for (const scene of scenes) {
      const size = "size" in scene && scene.size ? scene.size : DEFAULT_SIZE;
      console.log(`Rendering ${scene.filename} (${size.width}×${size.height})…`);
      await page.setViewportSize(size);
      await page.setContent(scene.html, { waitUntil: "networkidle" });
      await page.waitForSelector('[data-appsumo-ready="true"]');
      await page.waitForTimeout(300);

      const filePath = path.join(outDir, scene.filename);
      await page.locator("#appsumo-canvas").screenshot({ path: filePath, type: "png" });
      altLines.push(`${scene.filename}: ${scene.alt}`);
    }
  } finally {
    await browser.close();
  }

  if (!only) {
    const altPath = path.join(outDir, "alt-text.txt");
    writeFileSync(altPath, `${altLines.join("\n")}\n`, "utf8");
    const pngPaths = APPSUMO_HTML_SCENE_LIST.map((scene) => path.join(outDir, scene.filename));
    const zip = spawn(
      "zip",
      ["-j", zipPath, ...pngPaths, altPath],
      { cwd: root, stdio: "inherit" },
    );
    await new Promise<void>((resolve, reject) => {
      zip.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`zip exited with code ${code}`));
      });
    });
    console.log(`Done.\nPNG folder: ${outDir}\nZip: ${zipPath}`);
  } else {
    console.log(`Done.\nPNG: ${path.join(outDir, scenes[0]!.filename)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
