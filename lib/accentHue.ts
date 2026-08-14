// Hue helpers to tint the brand-green Lottie assets (scissors, step-color) onto
// each product/page accent, so a purple or blue page isn't left with a green
// animation. The art is a single green family (~160°); rotating the whole thing
// by (accentHue - 160) maps it onto the accent while keeping its shading.

export const SCISSORS_BASE_HUE = 160;

/** Hue (deg) of a #rrggbb color. */
export function hexHue(hex: string): number {
  const n = hex.replace('#', '');
  if (n.length < 6) return SCISSORS_BASE_HUE;
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

/** Degrees to hue-rotate a green (~160°) Lottie onto the given accent. */
export function accentLottieHue(hex: string): number {
  return Math.round(hexHue(hex) - SCISSORS_BASE_HUE);
}
