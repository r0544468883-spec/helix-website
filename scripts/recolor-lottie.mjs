// Recolor a Lottie JSON to the HELIX emerald palette.
// Maps every fill/stroke/gradient color to an emerald shade by luminance —
// a cohesive monochrome-emerald look that keeps the illustration's depth.
//
// Usage: node scripts/recolor-lottie.mjs "<src.json>" "public/<dest>.json"
//
// HELIX emerald ramp (RGBA 0–1):
//   Dark  #065F46 [0.024, 0.373, 0.275]
//   Mid   #10B981 [0.0627, 0.7255, 0.5059]
//   Light #34D399 [0.2039, 0.8275, 0.6]

import fs from 'node:fs';

const DARK = [0.024, 0.373, 0.275];
const MID = [0.0627, 0.7255, 0.5059];
const LIGHT = [0.2039, 0.8275, 0.6];
const WHITE = [1, 1, 1];

const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function emeraldize(r, g, b) {
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0–1
  if (lum > 0.93) return WHITE; // keep bright highlights / paper white
  if (lum < 0.33) return lerp(DARK, MID, lum / 0.33);
  if (lum < 0.66) return lerp(MID, LIGHT, (lum - 0.33) / 0.33);
  return lerp(LIGHT, WHITE, (lum - 0.66) / 0.34);
}

const recolorRGBA = (k) => {
  const [nr, ng, nb] = emeraldize(k[0], k[1], k[2]);
  return [nr, ng, nb, ...k.slice(3)];
};

function applyGradientStops(arr, p) {
  // First p*4 entries are colour stops: [offset, r, g, b] × p
  for (let i = 0; i < p; i++) {
    const base = i * 4;
    if (base + 3 < arr.length) {
      const [nr, ng, nb] = emeraldize(arr[base + 1], arr[base + 2], arr[base + 3]);
      arr[base + 1] = nr;
      arr[base + 2] = ng;
      arr[base + 3] = nb;
    }
  }
}

function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (!o || typeof o !== 'object') return;

  // Solid fill / stroke
  if ((o.ty === 'fl' || o.ty === 'st') && o.c) {
    if (o.c.a === 0 && Array.isArray(o.c.k) && typeof o.c.k[0] === 'number') {
      o.c.k = recolorRGBA(o.c.k);
    } else if (o.c.a === 1 && Array.isArray(o.c.k)) {
      o.c.k.forEach((kf) => {
        if (kf && Array.isArray(kf.s) && typeof kf.s[0] === 'number') kf.s = recolorRGBA(kf.s);
      });
    }
  }

  // Gradient fill / stroke
  if ((o.ty === 'gf' || o.ty === 'gs') && o.g && o.g.k) {
    const p = o.g.p || 0;
    if (o.g.k.a === 0 && Array.isArray(o.g.k.k)) applyGradientStops(o.g.k.k, p);
    else if (o.g.k.a === 1 && Array.isArray(o.g.k.k)) {
      o.g.k.k.forEach((kf) => {
        if (kf && Array.isArray(kf.s)) applyGradientStops(kf.s, p);
      });
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
