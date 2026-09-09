/**
 * Generate ClickNsit brand icons for the mobile app from the web logo design.
 * Web logo mark: indigo badge (#312e81, stroke #4338ca) + white cursor arrow
 * + orange accent dot (#f26338) + "ClickNsit" wordmark + "CLICK. SIT. DONE." tagline.
 *
 * Run from mobile/:  node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'assets', 'images');

const INDIGO = '#312E81';
const INDIGO_STROKE = '#4338CA';
const INDIGO_HI = '#4F46E5';
const ORANGE = '#F26338';
const NAVY = '#1B2559';
const FONT = "'Segoe UI','DejaVu Sans',Arial,sans-serif";

/** Cursor mark (arrow + orange dot + ring) as SVG group content, in a 0..w local box. */
function cursorMark({ arrowFill = '#FFFFFF', arrowStroke = 'none', dotFill = ORANGE, ringStroke = ORANGE } = {}) {
  // Original geometry from web logo (badge inner coords): path M48 38 L48 90 L60 76 L75 96 L84 91 L69 72 L85 70 Z, dot (84,91)
  const arrow = `M48 38 L48 90 L60 76 L75 96 L84 91 L69 72 L85 70 Z`;
  return `
    <path d="${arrow}" fill="${arrowFill}" ${arrowStroke !== 'none' ? `stroke="${arrowStroke}" stroke-width="0.8" stroke-linejoin="round"` : ''}/>
    <circle cx="84" cy="91" r="3.5" fill="${dotFill}" opacity="0.95"/>
    <circle cx="84" cy="91" r="7" fill="none" stroke="${ringStroke}" stroke-width="1" opacity="0.4"/>
  `;
}

function svgDocument(inner, size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${inner}</svg>`;
}

async function render(svg, outFile, { width } = {}) {
  const img = sharp(Buffer.from(svg), { density: 300 });
  const out = width ? img.resize(width, width) : img;
  await out.png().toFile(path.join(OUT, outFile));
  console.log('✅', outFile);
}

// ---------- 1) icon.png — 1024 full-bleed brand square (iOS / legacy Android / store) ----------
{
  const S = 1024;
  const inner = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${INDIGO_HI}"/>
        <stop offset="1" stop-color="${INDIGO}"/>
      </linearGradient>
    </defs>
    <rect width="${S}" height="${S}" fill="url(#bg)"/>
    <g transform="translate(${512 - 66.5 * 6.2}, ${370 - 67 * 6.2}) scale(6.2)">${cursorMark()}</g>
    <text x="512" y="775" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="132">
      <tspan fill="#FFFFFF">Click</tspan><tspan fill="${ORANGE}">Nsit</tspan>
    </text>
    <text x="512" y="848" text-anchor="middle" font-family="${FONT}" font-weight="500" font-size="34" letter-spacing="10" fill="#94A3B8" opacity="0.85">CLICK. SIT. DONE.</text>
  `;
  await render(svgDocument(inner, S), 'icon.png');
}

// ---------- 2) android-icon-foreground.png — white cursor+dot centered in safe zone, transparent ----------
{
  const S = 1024;
  const inner = `
    <g transform="translate(${512 - 66.5 * 6.4}, ${452 - 67 * 6.4}) scale(6.4)">${cursorMark()}</g>
  `;
  await render(svgDocument(inner, S), 'android-icon-foreground.png');
}

// ---------- 3) android-icon-background.png — solid navy ----------
{
  const S = 1024;
  await render(svgDocument(`<rect width="${S}" height="${S}" fill="${NAVY}"/>`, S), 'android-icon-background.png');
}

// ---------- 4) android-icon-monochrome.png — all-white mark on transparent (themed icons) ----------
{
  const S = 1024;
  const inner = `
    <g transform="translate(${512 - 66.5 * 6.4}, ${452 - 67 * 6.4}) scale(6.4)">${cursorMark({ arrowFill: '#FFFFFF', dotFill: '#FFFFFF', ringStroke: '#FFFFFF' })}</g>
  `;
  await render(svgDocument(inner, S), 'android-icon-monochrome.png');
}

// ---------- 5) splash-icon.png — white mark + wordmark on transparent (navy bg from config) ----------
{
  const S = 768;
  const inner = `
    <g transform="translate(${384 - 66.5 * 3.6}, ${300 - 67 * 3.6}) scale(3.6)">${cursorMark()}</g>
    <text x="384" y="520" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="92">
      <tspan fill="#FFFFFF">Click</tspan><tspan fill="${ORANGE}">Nsit</tspan>
    </text>
    <text x="384" y="572" text-anchor="middle" font-family="${FONT}" font-weight="500" font-size="26" letter-spacing="7" fill="#94A3B8" opacity="0.9">CLICK. SIT. DONE.</text>
  `;
  await render(svgDocument(inner, S), 'splash-icon.png');
}

// ---------- 6) favicon.png — 192px from icon.png ----------
await sharp(path.join(OUT, 'icon.png')).resize(192, 192).png().toFile(path.join(OUT, 'favicon.png'));
console.log('✅ favicon.png');

console.log('\nAll icons generated in', OUT);
