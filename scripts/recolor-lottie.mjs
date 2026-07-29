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
  if (l > 0.8) return WHITE; // bright / paper / skin highlights → white
  if (s < 0.15) return lerp(NEUTRAL.d, NEUTRAL.l, l); // grayscale → cool neutral ramp
  const warm = h < 50 || h >= 310; // reds, oranges, yellows, pinks, skin
  // Light warm = skin / peach → keep people human (white), don't tint them.
  if (warm && l > 0.5) return WHITE;
  if (warm) return ramp(GOLD, clamp(l * 1.15)); // saturated warm objects → gold accent
  return ramp(EMERALD, clamp(l * 1.1)); // cool hues → emerald (primary)
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
