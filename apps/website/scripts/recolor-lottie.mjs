// Recolor a Lottie JSON to the HELIX palette — HUE-AWARE (not monochrome).
//   cool hues (green/teal/blue/purple) → emerald ramp   (#065F46 → #10B981 → #16FFAB)
//   warm hues (red/orange/yellow/skin)  → gold ramp      (#7A3E12 → #F59E0B → #FCD34D)
//   low-saturation                      → cool neutral    (navy #16233F → near-white)
//   very light                          → white (paper / highlights)
// This keeps the illustration lively (two complementary hues + neutrals) while staying on-brand.
//
// Usage: node scripts/recolor-lottie.mjs "<src.json>" "public/<dest>.json"

import fs from 'node:fs';

const WHITE = [1, 1, 1];
const EMERALD = { d: [0.024, 0.373, 0.275], m: [0.063, 0.725, 0.506], l: [0.086, 1.0, 0.671] };
const GOLD = { d: [0.478, 0.243, 0.071], m: [0.961, 0.62, 0.043], l: [0.988, 0.827, 0.42] };
const NEUTRAL = { d: [0.086, 0.13, 0.22], l: [0.9, 0.93, 0.95] };
// Human tones — matched to the ecommerce (websites-hero) illustration the user liked.
const SKIN = { d: [0.929, 0.447, 0.31], m: [0.973, 0.631, 0.478], l: [0.984, 0.761, 0.6] }; // #ED724F → #F8A17A → #FBC299
const BLUE = { d: [0.227, 0.431, 0.561], m: [0.541, 0.749, 0.871], l: [0.804, 0.882, 0.945] }; // jeans blue #8ABFDE

const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (v) => Math.max(0, Math.min(1, v));

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s, l];
}

function ramp(rp, t) {
  return t < 0.5 ? lerp(rp.d, rp.m, t / 0.5) : lerp(rp.m, rp.l, (t - 0.5) / 0.5);
}

function helixColor(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (l > 0.9) return WHITE; // near-white paper / highlights
  if (s < 0.14) return lerp(NEUTRAL.d, NEUTRAL.l, l); // grayscale → cool neutral ramp

  // TRUE blue (azure/denim) → jeans blue (pants). Indigo/violet falls through to emerald.
  if (h >= 195 && h < 243) return ramp(BLUE, clamp((l - 0.1) / 0.8));

  // Warm family (reds, oranges, yellows, pinks, skin)
  if (h <= 50 || h >= 345) {
    // Orange-red side (h≤40) at mid-to-light = human skin tone. The pink-red
    // side (h≥345, e.g. the growth arrow) is NOT skin → falls through to emerald.
    if (l >= 0.42 && h <= 40) return ramp(SKIN, clamp((l - 0.35) / 0.5));
    return ramp(EMERALD, clamp(l * 1.1)); // yellow / pink-red objects → emerald (brand)
  }

  // Everything else cool (green, teal, indigo, violet, purple) → emerald (brand primary)
  return ramp(EMERALD, clamp(l * 1.1));
}

const recolorRGBA = (k) => [...helixColor(k[0], k[1], k[2]), ...k.slice(3)];

function applyGradientStops(arr, p) {
  for (let i = 0; i < p; i++) {
    const base = i * 4;
    if (base + 3 < arr.length) {
      const [nr, ng, nb] = helixColor(arr[base + 1], arr[base + 2], arr[base + 3]);
      arr[base + 1] = nr; arr[base + 2] = ng; arr[base + 3] = nb;
    }
  }
}

function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (!o || typeof o !== 'object') return;

  if ((o.ty === 'fl' || o.ty === 'st') && o.c) {
    if (o.c.a === 0 && Array.isArray(o.c.k) && typeof o.c.k[0] === 'number') {
      o.c.k = recolorRGBA(o.c.k);
    } else if (o.c.a === 1 && Array.isArray(o.c.k)) {
      o.c.k.forEach((kf) => {
        if (kf && Array.isArray(kf.s) && typeof kf.s[0] === 'number') kf.s = recolorRGBA(kf.s);
      });
    }
  }

  if ((o.ty === 'gf' || o.ty === 'gs') && o.g && o.g.k) {
    const p = o.g.p || 0;
    if (o.g.k.a === 0 && Array.isArray(o.g.k.k)) applyGradientStops(o.g.k.k, p);
    else if (o.g.k.a === 1 && Array.isArray(o.g.k.k)) {
      o.g.k.k.forEach((kf) => { if (kf && Array.isArray(kf.s)) applyGradientStops(kf.s, p); });
    }
  }

  Object.values(o).forEach(walk);
}

const [, , src, dst] = process.argv;
if (!src || !dst) {
  console.error('Usage: node scripts/recolor-lottie.mjs "<src.json>" "public/<dest>.json"');
  process.exit(1);
}
const json = JSON.parse(fs.readFileSync(src, 'utf8'));
walk(json);
fs.writeFileSync(dst, JSON.stringify(json));
console.log(`recolored ${src} → ${dst}`);
