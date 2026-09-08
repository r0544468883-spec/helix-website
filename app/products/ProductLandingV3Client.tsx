'use client';

import { useEffect } from 'react';

// The design mocks use these two libraries (confetti on pricing select, Lottie
// for the "how it works" animation). Loaded once, client-side; the mock JS
// already guards `typeof confetti === 'function'` / `window.lottie`.
const CDN = [
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js',
];

function loadScript(src: string) {
  return new Promise<void>((resolve) => {
    if ([...document.scripts].some((s) => s.src === src)) return resolve();
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => resolve(); // fail open — the mock JS degrades gracefully
    document.head.appendChild(el);
  });
}

/**
 * Runs a product landing's original interaction script against the real,
 * server-rendered DOM (scroll reveals, count-ups, autonomy switch, tilt,
 * pricing carousel, Lottie/confetti). The content itself is SSR'd by
 * ProductLandingV3, so it is fully visible/indexable even if this never runs.
 */
export default function ProductLandingV3Client({ js }: { js: string }) {
  useEffect(() => {
    let cancelled = false;
    Promise.all(CDN.map(loadScript)).then(() => {
      if (cancelled) return;
      try {
        // eslint-disable-next-line no-new-func
        new Function(js)();
      } catch (e) {
        console.error('[product-landing] interaction script failed:', e);
        // Fail open: never leave scroll-reveal content stuck at opacity:0.
        document
          .querySelectorAll('#plv3 .reveal:not(.in)')
          .forEach((el) => el.classList.add('in'));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [js]);

  return null;
}
