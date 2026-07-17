/**
 * Generates per-page Open Graph SVG templates so social previews carry the
 * real page headline set in the brand display face, with zero runtime font
 * dependencies. Output: public/brand/social/pages/<slug>.svg, consumed by
 * each route's opengraph-image.tsx.
 *
 * Run: npx tsx scripts/generate-og-pages.ts
 * Requires: .brand-src/Fraunces-var.ttf and .brand-src/InstrumentSans-var.ttf
 */
import * as fontkit from "fontkit";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { featureOrder, features } from "../src/lib/site/features";

function openInstance(
  file: string,
  variation: Record<string, number>,
): fontkit.Font {
  const loaded = fontkit.openSync(path.join(process.cwd(), ".brand-src", file));
  const base = (
    "fonts" in loaded ? (loaded as fontkit.FontCollection).fonts[0] : loaded
  ) as fontkit.Font;
  return base.getVariation(variation);
}

const display = openInstance("Fraunces-var.ttf", {
  wght: 600,
  opsz: 144,
  SOFT: 0,
  WONK: 0,
});
const sans = openInstance("InstrumentSans-var.ttf", { wght: 500, wdth: 100 });

/** Typesets one line into an SVG path string in a 100-unit em space. */
function typeset(font: fontkit.Font, text: string): { d: string; width: number } {
  const run = font.layout(text);
  const scale = 100 / font.unitsPerEm;
  const ascent = font.ascent * scale;

  let x = 0;
  const parts: string[] = [];
  for (let i = 0; i < run.glyphs.length; i++) {
    const glyph = run.glyphs[i];
    const pos = run.positions[i];
    const dx = (x + pos.xOffset) * scale;
    const cmds: string[] = [];
    const fx = (v: number) => +(v * scale + dx).toFixed(2);
    const fy = (v: number) => +(ascent - v * scale).toFixed(2);
    glyph.path.toFunction()({
      moveTo: (px: number, py: number) => cmds.push(`M${fx(px)} ${fy(py)}`),
      lineTo: (px: number, py: number) => cmds.push(`L${fx(px)} ${fy(py)}`),
      quadraticCurveTo: (cx: number, cy: number, px: number, py: number) =>
        cmds.push(`Q${fx(cx)} ${fy(cy)} ${fx(px)} ${fy(py)}`),
      bezierCurveTo: (
        c1x: number,
        c1y: number,
        c2x: number,
        c2y: number,
        px: number,
        py: number,
      ) =>
        cmds.push(
          `C${fx(c1x)} ${fy(c1y)} ${fx(c2x)} ${fy(c2y)} ${fx(px)} ${fy(py)}`,
        ),
      closePath: () => cmds.push("Z"),
    } as unknown as CanvasRenderingContext2D);
    if (cmds.length) parts.push(cmds.join(""));
    x += pos.xAdvance;
  }
  return { d: parts.join(""), width: x * scale };
}

function measure(font: fontkit.Font, text: string): number {
  const run = font.layout(text);
  const scale = 100 / font.unitsPerEm;
  return run.positions.reduce((w, p) => w + p.xAdvance, 0) * scale;
}

/** Greedy word wrap in em-space units. */
function wrap(font: fontkit.Font, text: string, maxUnits: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(font, candidate) <= maxUnits || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const CANVAS = { width: 1200, height: 630 };
const MARGIN = 96;
const MAX_WIDTH = CANVAS.width - MARGIN * 2;

interface OgPage {
  slug: string;
  eyebrow: string;
  title: string;
}

const pages: OgPage[] = [
  { slug: "pricing", eyebrow: "Pricing", title: "Three plans. No decoder ring." },
  { slug: "features", eyebrow: "Features", title: "Watch. Verify. Alert. Communicate. Learn." },
  { slug: "integrations", eyebrow: "Integrations", title: "Alerts land where your team already looks." },
  { slug: "security", eyebrow: "Security", title: "Built to watch your infrastructure without becoming a risk to it." },
  { slug: "about", eyebrow: "About", title: "Software gets complicated. Knowing whether it works should not." },
  { slug: "contact", eyebrow: "Contact", title: "Talk to a person." },
  { slug: "changelog", eyebrow: "Changelog", title: "What shipped." },
  { slug: "roadmap", eyebrow: "Roadmap", title: "Where this is going." },
  ...featureOrder.map((slug) => ({
    slug,
    eyebrow: features[slug].name,
    title: features[slug].headline,
  })),
];

/** Fajita mark, copied from the approved og-template composition. */
const MARK = `<g transform="translate(${MARGIN} ${MARGIN})">
    <rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="#faf5ea" stroke-width="5" fill="none"/>
    <path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="#faf5ea" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="32" cy="15.5" r="4.5" fill="#f5921b"/>
  </g>`;

function buildSvg(page: OgPage): string {
  /* Pick the largest size that fits within two lines; allow three only at
     the smallest sizes so long headlines never crowd the footer. */
  let fontSize = 84;
  let lines: string[] = [];
  for (const size of [84, 76, 68, 60, 52]) {
    fontSize = size;
    lines = wrap(display, page.title, (MAX_WIDTH / size) * 100);
    if (lines.length <= 2) break;
  }
  if (lines.length > 3) {
    fontSize = 46;
    lines = wrap(display, page.title, (MAX_WIDTH / 46) * 100);
  }

  const lineHeight = fontSize * 1.12;
  /* Anchor the block bottom above the footer line, growing upward. */
  const titleTop = 460 - lines.length * lineHeight;

  const titleGroups = lines
    .map((line, i) => {
      const { d } = typeset(display, line);
      const y = titleTop + i * lineHeight;
      return `<g transform="translate(${MARGIN} ${y.toFixed(1)}) scale(${(fontSize / 100).toFixed(4)})"><path d="${d}" fill="#faf5ea"/></g>`;
    })
    .join("\n  ");

  /* Eyebrow: letterspaced Instrument Sans in ember. */
  const eyebrowText = page.eyebrow.toUpperCase();
  const eyebrowSize = 24;
  const eyebrowParts = eyebrowText.split("").map((ch) => typeset(sans, ch));
  let ex = 0;
  const tracking = 26; // units in em space (0.26em)
  const eyebrowPaths = eyebrowParts
    .map((part, i) => {
      const g = `<g transform="translate(${ex.toFixed(1)} 0)"><path d="${part.d}" fill="#f5921b"/></g>`;
      ex += part.width + (i < eyebrowParts.length - 1 ? tracking : 0);
      return g;
    })
    .join("");
  const eyebrowGroup = `<g transform="translate(${MARGIN} ${(titleTop - 44).toFixed(1)}) scale(${(eyebrowSize / 100).toFixed(4)})">${eyebrowPaths}</g>`;

  /* Footer: fajita.io in cream sans. */
  const footer = typeset(sans, "fajita.io");
  const footerGroup = `<g transform="translate(${MARGIN} ${CANVAS.height - MARGIN - 30}) scale(0.28)"><path d="${footer.d}" fill="#faf5ea" opacity="0.75"/></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}">
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="#17130e"/>
  <ellipse cx="600" cy="700" rx="720" ry="260" fill="#e8590c" opacity="0.16"/>
  <ellipse cx="600" cy="740" rx="460" ry="180" fill="#f5921b" opacity="0.14"/>
  ${MARK}
  ${eyebrowGroup}
  ${titleGroups}
  ${footerGroup}
</svg>
`;
}

const outDir = path.join(process.cwd(), "public", "brand", "social", "pages");
mkdirSync(outDir, { recursive: true });

for (const page of pages) {
  const svg = buildSvg(page);
  writeFileSync(path.join(outDir, `${page.slug}.svg`), svg);
  console.log(`og page written: ${page.slug}.svg`);
}
