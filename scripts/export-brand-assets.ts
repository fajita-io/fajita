/**
 * Exports the static /public/brand SVG asset set from the same generated
 * path data the React components use. One source of truth; re-run after
 * regenerating wordmark or tagline data.
 *
 * Run: npx tsx scripts/export-brand-assets.ts
 */
import * as fontkit from "fontkit";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const wordmark = JSON.parse(
  readFileSync(
    path.join(root, "src/components/brand/logo/wordmark-data.json"),
    "utf8",
  ),
) as {
  width: number;
  height: number;
  paths: string[];
  emberDot: { cx: number; cy: number; r: number };
};
const tagline = JSON.parse(
  readFileSync(
    path.join(root, "src/components/brand/logo/tagline-data.json"),
    "utf8",
  ),
) as { width: number; height: number; paths: string[] };

const CARBON = "#17130e";
const CREAM = "#faf5ea";
const CREAM_BG = "#fffdf7";
const EMBER_LIGHT = "#d9480f"; // on light backgrounds
const EMBER_DARK = "#f5921b"; // on dark backgrounds

function openSansInstance(weight: number): fontkit.Font {
  const loaded = fontkit.openSync(
    path.join(root, ".brand-src", "InstrumentSans-var.ttf"),
  );
  const base = (
    "fonts" in loaded ? (loaded as fontkit.FontCollection).fonts[0] : loaded
  ) as fontkit.Font;
  return base.getVariation({ wght: weight, wdth: 100 });
}

/** Typesets one line into an SVG path string in a 100-unit em space. */
function typesetSans(text: string, weight = 500): { d: string; width: number; height: number } {
  const font = openSansInstance(weight);
  const run = font.layout(text);
  const scale = 100 / font.unitsPerEm;
  const ascent = font.ascent * scale;
  const descent = Math.abs(font.descent * scale);

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
  return { d: parts.join(""), width: x * scale, height: ascent + descent };
}

function markSvg(opts: {
  ink: string;
  ember: string;
  bg?: string;
  bgRadius?: number;
  small?: boolean;
}) {
  const { ink, ember, bg, bgRadius = 16, small = false } = opts;
  const stroke = small ? 6.5 : 5;
  const wave = small ? "M13 42h9l9-17 9 17h11" : "M14 42h9.5L32 25.5 40.5 42H50";
  const dot = small
    ? `<circle cx="32" cy="15" r="5.5" fill="${ember}"/>`
    : `<circle cx="32" cy="15.5" r="4.5" fill="${ember}"/>`;
  const frame = bg
    ? `<rect width="64" height="64" rx="${bgRadius}" fill="${bg}"/>`
    : `<rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="${ink}" stroke-width="${stroke}" fill="none"/>`;
  const boundary = bg
    ? "" // filled tile versions drop the outline; the tile is the boundary
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  ${frame}${boundary}
  <path d="${wave}" stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  ${dot}
</svg>
`;
}

function wordmarkSvg(ink: string, ember: string) {
  const glyphs = wordmark.paths.map((d) => `<path d="${d}" fill="${ink}"/>`).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wordmark.width} ${wordmark.height}" role="img" aria-label="Fajita">
  ${glyphs}
  <circle cx="${wordmark.emberDot.cx}" cy="${wordmark.emberDot.cy}" r="${(wordmark.emberDot.r * 1.12).toFixed(2)}" fill="${ember}"/>
</svg>
`;
}

function horizontalLogoSvg(ink: string, ember: string) {
  // mark 64 tall, wordmark scaled to cap-region ~56 tall, gap 20
  const wmScale = 56 / wordmark.height;
  const wmWidth = wordmark.width * wmScale;
  const totalW = 64 + 20 + wmWidth;
  const glyphs = wordmark.paths
    .map((d) => `<path d="${d}" fill="${ink}"/>`)
    .join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(1)} 64" role="img" aria-label="Fajita">
  <rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="${ink}" stroke-width="5" fill="none"/>
  <path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="${ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="32" cy="15.5" r="4.5" fill="${ember}"/>
  <g transform="translate(84 4) scale(${wmScale.toFixed(4)})">
    ${glyphs}
    <circle cx="${wordmark.emberDot.cx}" cy="${wordmark.emberDot.cy}" r="${(wordmark.emberDot.r * 1.12).toFixed(2)}" fill="${ember}"/>
  </g>
</svg>
`;
}

function stackedLogoSvg(ink: string, ember: string) {
  const wmScale = 44 / wordmark.height;
  const wmWidth = wordmark.width * wmScale;
  const totalW = Math.max(64, wmWidth);
  const markX = (totalW - 64) / 2;
  const wmX = (totalW - wmWidth) / 2;
  const glyphs = wordmark.paths
    .map((d) => `<path d="${d}" fill="${ink}"/>`)
    .join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(1)} 128" role="img" aria-label="Fajita">
  <g transform="translate(${markX.toFixed(1)} 0)">
    <rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="${ink}" stroke-width="5" fill="none"/>
    <path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="${ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="32" cy="15.5" r="4.5" fill="${ember}"/>
  </g>
  <g transform="translate(${wmX.toFixed(1)} 80) scale(${wmScale.toFixed(4)})">
    ${glyphs}
    <circle cx="${wordmark.emberDot.cx}" cy="${wordmark.emberDot.cy}" r="${(wordmark.emberDot.r * 1.12).toFixed(2)}" fill="${ember}"/>
  </g>
</svg>
`;
}

function socialSurfaceDefs(
  prefix: string,
  width: number,
  height: number,
  glowCenter: { x: number; y: number },
) {
  return `<defs>
    <pattern id="${prefix}-heat-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="${CREAM}" stroke-width="0.5" opacity="0.06"/>
    </pattern>
    <linearGradient id="${prefix}-ember-wash" x1="0" y1="${height}" x2="${Math.round(width * 0.55)}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#e8590c" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="#f5921b" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#17130e" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${prefix}-pulse-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${glowCenter.x} ${glowCenter.y}) rotate(90) scale(88 168)">
      <stop stop-color="#f5921b" stop-opacity="0.18"/>
      <stop stop-color="#17130e" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
}

function socialSurfaceBackground(prefix: string, width: number, height: number) {
  return `<rect width="${width}" height="${height}" fill="${CARBON}"/>
  <rect width="${width}" height="${height}" fill="url(#${prefix}-ember-wash)"/>
  <rect width="${width}" height="${height}" fill="url(#${prefix}-heat-grid)"/>
  <ellipse cx="${Math.round(width * 0.22)}" cy="${Math.round(height * 1.02)}" rx="${Math.round(width * 0.36)}" ry="${Math.round(height * 0.34)}" fill="#e8590c" opacity="0.12"/>
  <ellipse cx="${Math.round(width * 0.78)}" cy="${Math.round(height * 0.96)}" rx="${Math.round(width * 0.3)}" ry="${Math.round(height * 0.22)}" fill="#f5921b" opacity="0.09"/>`;
}

/** Held-pulse monitor card for social surfaces (coordinates relative to card origin). */
function monitorCardSvg(cardX: number, cardY: number, cardW: number, cardH: number, glowId: string) {
  const uptimeSegments = Array.from({ length: 34 }, (_, i) => {
    const x = 36 + i * 8.4;
    const fill =
      i === 26 ? "#f59f00" : i === 27 ? "#e03131" : i > 27 ? "#2f9e44" : "#2f9e44";
    const opacity = i === 26 || i === 27 ? 0.95 : 0.34 + (i % 5) * 0.04;
    return `<rect x="${x.toFixed(1)}" y="${cardH - 52}" width="5.5" height="10" rx="1.5" fill="${fill}" opacity="${opacity.toFixed(2)}"/>`;
  }).join("\n    ");

  return `<g opacity="0.94" transform="translate(${cardX} ${cardY})">
    <rect width="${cardW}" height="${cardH}" rx="24" fill="#1f1a14" stroke="${CREAM}" stroke-opacity="0.12" stroke-width="1"/>
    <rect width="${cardW}" height="${cardH}" rx="24" fill="url(#${glowId})"/>
    <rect x="28" y="28" width="118" height="30" rx="15" fill="${CREAM}" fill-opacity="0.06"/>
    <rect x="36" y="36" width="12" height="8" rx="4" fill="#2f9e44"/>
    <path d="M54 40h72" stroke="${CREAM}" stroke-opacity="0.38" stroke-width="1.75" stroke-linecap="round"/>
    <path d="M36 248 L88 196 L132 214 L176 156 L220 176 L264 132 L308 154" fill="none" stroke="${CREAM}" stroke-opacity="0.16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M36 248 L88 196 L132 214 L176 156 L220 176 L264 132 L308 154" fill="none" stroke="${EMBER_DARK}" stroke-opacity="0.88" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="176" cy="156" r="6" fill="${EMBER_DARK}"/>
    <circle cx="176" cy="156" r="12" fill="${EMBER_DARK}" opacity="0.2"/>
    <circle cx="88" cy="196" r="3.5" fill="#2f9e44"/>
    <circle cx="132" cy="214" r="3.5" fill="#2f9e44"/>
    <circle cx="220" cy="176" r="3.5" fill="#2f9e44"/>
    <circle cx="264" cy="132" r="3.5" fill="#2f9e44"/>
    <circle cx="308" cy="154" r="3.5" fill="#2f9e44"/>
    <rect x="28" y="${cardH - 72}" width="${cardW - 56}" height="1" fill="${CREAM}" opacity="0.1"/>
    ${uptimeSegments}
  </g>`;
}

/** Open Graph default: 1200×630 editorial lockup for fajita.io shares. */
function ogTemplateSvg() {
  const W = 1200;
  const H = 630;
  const margin = 96;
  const logoScale = 0.68;
  const innerWmScale = 56 / wordmark.height;
  const logoH = 64 * logoScale;
  const taglineScale = 0.384;
  const taglineY = margin + logoH + 40;
  const glyphs = wordmark.paths.map((d) => `<path d="${d}" fill="${CREAM}"/>`).join("\n      ");
  const tg = tagline.paths.map((d) => `<path d="${d}" fill="${CREAM}"/>`).join("\n    ");
  const cardX = 748;
  const cardY = 88;
  const cardW = 356;
  const cardH = 454;
  const glowCenter = { x: cardX + cardW / 2, y: cardY + cardH * 0.42 };
  const footer = typesetSans("fajita.io", 500);
  const footerScale = 0.28;
  const footerY = H - margin - footer.height * footerScale;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Fajita. Know when your software gets too hot.">
  ${socialSurfaceDefs("og", W, H, glowCenter)}
  ${socialSurfaceBackground("og", W, H)}
  <rect x="${margin}" y="${(taglineY + tagline.height * taglineScale + 36).toFixed(1)}" width="72" height="3" rx="1.5" fill="${EMBER_DARK}" opacity="0.9"/>
  <g transform="translate(${margin} ${margin}) scale(${logoScale.toFixed(4)})">
    <rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="${CREAM}" stroke-width="5" fill="none"/>
    <path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="${CREAM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="32" cy="15.5" r="4.5" fill="${EMBER_DARK}"/>
    <g transform="translate(84 4) scale(${innerWmScale.toFixed(4)})">
      ${glyphs}
      <circle cx="${wordmark.emberDot.cx}" cy="${wordmark.emberDot.cy}" r="${(wordmark.emberDot.r * 1.12).toFixed(2)}" fill="${EMBER_DARK}"/>
    </g>
  </g>
  <g transform="translate(${margin} ${taglineY.toFixed(1)}) scale(${taglineScale.toFixed(4)})">
    ${tg}
  </g>
  <g transform="translate(${margin} ${footerY.toFixed(1)}) scale(${footerScale.toFixed(4)})"><path d="${footer.d}" fill="${CREAM}" opacity="0.62"/></g>
  ${monitorCardSvg(cardX, cardY, cardW, cardH, "og-pulse-glow")}
</svg>
`;
}

function emailHeaderSvg() {
  const wmScale = 40 / wordmark.height;
  const glyphs = wordmark.paths.map((d) => `<path d="${d}" fill="${CARBON}"/>`).join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 96">
  <rect width="600" height="96" fill="${CREAM_BG}"/>
  <rect x="0" y="93" width="600" height="3" fill="${EMBER_LIGHT}"/>
  <g transform="translate(40 24)">
    <rect x="2.5" y="2.5" width="43" height="43" rx="12" stroke="${CARBON}" stroke-width="4" fill="none"/>
    <path d="M10.5 31.5h7.1l6.4-12.4 6.4 12.4h7.1" stroke="${CARBON}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="24" cy="11.6" r="3.4" fill="${EMBER_LIGHT}"/>
  </g>
  <g transform="translate(104 28) scale(${wmScale.toFixed(4)})">
    ${glyphs}
    <circle cx="${wordmark.emberDot.cx}" cy="${wordmark.emberDot.cy}" r="${(wordmark.emberDot.r * 1.12).toFixed(2)}" fill="${EMBER_LIGHT}"/>
  </g>
</svg>
`;
}

function xHeaderSvg() {
  const tgScale = 60 / tagline.height;
  const tgWidth = tagline.width * tgScale;
  const tg = tagline.paths.map((d) => `<path d="${d}" fill="${CREAM}"/>`).join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 500">
  <rect width="1500" height="500" fill="${CARBON}"/>
  <ellipse cx="750" cy="620" rx="900" ry="280" fill="#e8590c" opacity="0.15"/>
  <g transform="translate(${((1500 - tgWidth) / 2).toFixed(1)} 205) scale(${tgScale.toFixed(4)})">
    ${tg}
  </g>
</svg>
`;
}

/** LinkedIn company cover: 1128×191 px (safe for logo overlap bottom-left). */
function linkedinCoverSvg() {
  const W = 1128;
  const H = 191;
  const logoScale = 44 / 64;
  const logoW = (64 + 20 + (wordmark.width * 56) / wordmark.height) * logoScale;
  const logoX = W - logoW - 44;
  const logoY = H - 44 - 28;
  const glyphs = wordmark.paths
    .map((d) => `<path d="${d}" fill="${CREAM}"/>`)
    .join("\n      ");
  const innerWmScale = 56 / wordmark.height;

  const uptimeSegments = Array.from({ length: 32 }, (_, i) => {
    const x = 612 + i * 9;
    const fill =
      i === 24 ? "#f59f00" : i === 25 ? "#e03131" : i > 25 ? "#2f9e44" : "#2f9e44";
    const opacity = i === 24 || i === 25 ? 0.95 : 0.35 + (i % 5) * 0.04;
    return `<rect x="${x}" y="154" width="6" height="8" rx="1.5" fill="${fill}" opacity="${opacity.toFixed(2)}"/>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <pattern id="heat-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="${CREAM}" stroke-width="0.5" opacity="0.06"/>
    </pattern>
    <linearGradient id="ember-wash" x1="0" y1="191" x2="640" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#e8590c" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="#f5921b" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#17130e" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="pulse-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(760 92) rotate(90) scale(72 140)">
      <stop stop-color="#f5921b" stop-opacity="0.16"/>
      <stop stop-color="#17130e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${CARBON}"/>
  <rect width="${W}" height="${H}" fill="url(#ember-wash)"/>
  <rect width="${W}" height="${H}" fill="url(#heat-grid)"/>
  <ellipse cx="320" cy="230" rx="420" ry="120" fill="#e8590c" opacity="0.1"/>
  <ellipse cx="860" cy="250" rx="360" ry="90" fill="#f5921b" opacity="0.07"/>
  <g opacity="0.9">
    <rect x="598" y="28" width="312" height="136" rx="22" fill="#1f1a14" stroke="${CREAM}" stroke-opacity="0.1" stroke-width="1"/>
    <rect x="598" y="28" width="312" height="136" rx="22" fill="url(#pulse-glow)"/>
    <path d="M628 108 L668 88 L708 98 L748 72 L788 82 L828 62 L868 78" fill="none" stroke="${CREAM}" stroke-opacity="0.18" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M628 108 L668 88 L708 98 L748 72 L788 82 L828 62 L868 78" fill="none" stroke="${EMBER_DARK}" stroke-opacity="0.85" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="748" cy="72" r="5" fill="${EMBER_DARK}"/>
    <circle cx="748" cy="72" r="10" fill="${EMBER_DARK}" opacity="0.18"/>
    <circle cx="668" cy="88" r="3" fill="#2f9e44"/>
    <circle cx="708" cy="98" r="3" fill="#2f9e44"/>
    <circle cx="788" cy="82" r="3" fill="#2f9e44"/>
    <circle cx="828" cy="62" r="3" fill="#2f9e44"/>
    <circle cx="868" cy="78" r="3" fill="#2f9e44"/>
    <rect x="612" y="44" width="52" height="18" rx="9" fill="${CREAM}" fill-opacity="0.06"/>
    <rect x="620" y="50" width="10" height="6" rx="3" fill="#2f9e44"/>
    <path d="M634 53h24" stroke="${CREAM}" stroke-opacity="0.35" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="612" y="118" width="284" height="1" fill="${CREAM}" opacity="0.08"/>
    ${uptimeSegments}
  </g>
  <g transform="translate(${logoX.toFixed(1)} ${logoY.toFixed(1)}) scale(${logoScale.toFixed(4)})">
    <rect x="3.5" y="3.5" width="57" height="57" rx="16" stroke="${CREAM}" stroke-width="5" fill="none"/>
    <path d="M14 42h9.5L32 25.5 40.5 42H50" stroke="${CREAM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="32" cy="15.5" r="4.5" fill="${EMBER_DARK}"/>
    <g transform="translate(84 4) scale(${innerWmScale.toFixed(4)})">
      ${glyphs}
      <circle cx="${wordmark.emberDot.cx}" cy="${wordmark.emberDot.cy}" r="${(wordmark.emberDot.r * 1.12).toFixed(2)}" fill="${EMBER_DARK}"/>
    </g>
  </g>
</svg>
`;
}

const files: Array<[string, string]> = [
  ["logos/fajita-mark.svg", markSvg({ ink: CARBON, ember: EMBER_LIGHT })],
  ["logos/fajita-mark-dark.svg", markSvg({ ink: CREAM, ember: EMBER_DARK })],
  ["logos/fajita-mark-mono.svg", markSvg({ ink: "#000000", ember: "#000000" })],
  ["logos/fajita-wordmark.svg", wordmarkSvg(CARBON, EMBER_LIGHT)],
  ["logos/fajita-wordmark-dark.svg", wordmarkSvg(CREAM, EMBER_DARK)],
  ["logos/fajita-wordmark-mono.svg", wordmarkSvg("#000000", "#000000")],
  ["logos/fajita-logo-horizontal.svg", horizontalLogoSvg(CARBON, EMBER_LIGHT)],
  ["logos/fajita-logo-horizontal-dark.svg", horizontalLogoSvg(CREAM, EMBER_DARK)],
  ["logos/fajita-logo-stacked.svg", stackedLogoSvg(CARBON, EMBER_LIGHT)],
  ["logos/fajita-logo-stacked-dark.svg", stackedLogoSvg(CREAM, EMBER_DARK)],
  [
    "icons/app-icon.svg",
    markSvg({ ink: CREAM, ember: EMBER_DARK, bg: CARBON, small: true }),
  ],
  [
    "icons/app-icon-square.svg",
    markSvg({ ink: CREAM, ember: EMBER_DARK, bg: CARBON, bgRadius: 0, small: true }),
  ],
  [
    "icons/social-avatar.svg",
    markSvg({ ink: CREAM, ember: EMBER_DARK, bg: CARBON, bgRadius: 0, small: true }),
  ],
  ["social/og-template.svg", ogTemplateSvg()],
  ["social/x-header.svg", xHeaderSvg()],
  ["social/linkedin-cover.svg", linkedinCoverSvg()],
  ["email/email-header.svg", emailHeaderSvg()],
];

async function main() {
  for (const [rel, content] of files) {
    const target = path.join(root, "public", "brand", rel);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
    console.log("wrote", path.join("public/brand", rel));
  }

  await exportEmailPngs();
}

/** Rasterize an SVG for email clients that block remote SVG (Outlook, Gmail). */
async function exportSvgToPng(opts: {
  svgRel: string;
  pngRel: string;
  width: number;
  height: number;
}) {
  const svgPath = path.join(root, "public", "brand", opts.svgRel);
  const pngPath = path.join(root, "public", "brand", opts.pngRel);
  const svg = readFileSync(svgPath, "utf8");
  mkdirSync(path.dirname(pngPath), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: opts.width, height: opts.height },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:transparent;">
        <div id="asset" style="width:${opts.width}px;height:${opts.height}px;line-height:0;">
          ${svg.replace(/<svg/, `<svg width="${opts.width}" height="${opts.height}"`)}
        </div>
      </body></html>`,
      { waitUntil: "networkidle" },
    );
    await page.locator("#asset").screenshot({ path: pngPath, type: "png" });
    console.log("wrote", path.join("public/brand", opts.pngRel));
  } finally {
    await browser.close();
  }
}

async function exportEmailPngs() {
  // App icon marks for email headers (PNG for clients that block SVG).
  await exportSvgToPng({
    svgRel: "icons/app-icon.svg",
    pngRel: "email/fajita-app-icon.png",
    width: 72,
    height: 72,
  });
  await exportSvgToPng({
    svgRel: "email/memo-icon.svg",
    pngRel: "email/memo-app-icon.png",
    width: 36,
    height: 36,
  });
  writeFileSync(
    path.join(root, "public", "brand", "email", "memo-icon.png"),
    readFileSync(path.join(root, "public", "brand", "email", "memo-app-icon.png")),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
