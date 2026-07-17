# Fajita social and platform assets

Version 1.0 · Phase 1

All social assets derive from one source of truth: `scripts/export-brand-assets.ts` reads the same generated path data the React components use, so a change to the wordmark or mark propagates everywhere on re-export. Do not hand-edit files in `public/brand/`.

## Inventory

| Asset | File | Notes |
| --- | --- | --- |
| X / LinkedIn / Product Hunt avatar | `public/brand/icons/social-avatar.svg` | Square, carbon tile; mark survives circle crop (tested in Brand Lab) |
| X header | `public/brand/social/x-header.svg` | 1500x500, tagline outlines on carbon with ember glow |
| Open Graph template | `public/brand/social/og-template.svg` | 1200x630; base for OG, blog share, glossary share, launch and incident graphics |
| OG production image | `/opengraph-image` route | PNG rendered from the SVG template at request/build time |
| Email header | `public/brand/email/email-header.svg` | 600x96 |
| Favicon | `src/app/icon.svg` | SVG favicon; Next serves it as `/icon.svg` |
| Apple touch icon | `/apple-icon` route | 180x180 PNG from app-icon source |
| App icon | `public/brand/icons/app-icon.svg` | Carbon tile, radius 16/64 |
| Logo set | `public/brand/logos/*.svg` | Horizontal, stacked, wordmark, mark; light/dark/mono |

Text in social assets is baked to outlines (`generate-tagline.ts`), so exports render identically with no font availability risk.

## Derivative templates

Launch announcements, incident graphics, operational status graphics, blog/glossary share images, Product Hunt gallery frames, and affiliate creative all start from `og-template.svg`: keep the carbon background, ember glow, mark placement; swap the tagline outlines for the specific message (regenerate via `generate-tagline.ts` with different text, or set live type in the ImageResponse route once per-page OG images ship).

## Export procedure (raster)

Platforms that reject SVG get PNG exports:

```bash
# regenerate sources first if identity changed
npx tsx scripts/generate-wordmark.ts && npx tsx scripts/generate-tagline.ts
npx tsx scripts/export-brand-assets.ts
# rasterize (any SVG renderer; sharp is already in the dependency tree via Next)
npx tsx -e "
import sharp from 'sharp';
await sharp('public/brand/social/og-template.svg').resize(1200,630).png().toFile('/tmp/og.png');
await sharp('public/brand/icons/social-avatar.svg').resize(800,800).png().toFile('/tmp/avatar.png');
"
```

## Legibility rules

- The mark stays >= 12% of the shortest edge on any social asset
- Tagline text >= 28px at final raster size (compression survival)
- Test every avatar in a circle crop and at 48px before publishing
- Carbon background + cream ink is the default social scheme; light-scheme social assets require a documented reason
