'use client';

import { useEffect, useRef } from 'react';

/**
 * Renders a product's new landing design inside an isolated same-origin iframe
 * (`/_mock/<slug>-landing.html`). Isolation is deliberate: the design is a full
 * standalone document with its own global CSS reset (`*`, `body`, `:root`) and
 * fonts; injecting it into the site's DOM makes the site's Tailwind/global CSS
 * bleed in and corrupt the layout. An iframe gives a clean document => it looks
 * exactly like the standalone preview, with the site's Nav (above) and Footer
 * (below) as the only chrome.
 *
 * On load we (a) hide the mock's OWN header/footer/exit-popup/partner banner so
 * only the site chrome shows, and (b) auto-size the iframe to its content height.
 */
export default function ProductLandingV2({ slug }: { slug: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let ro: ResizeObserver | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;

    const onLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        // Hide the mock's own chrome — the site provides Nav/Footer/popup.
        const style = doc.createElement('style');
        style.textContent =
          'header,footer,.xp-overlay,.partner{display:none!important}';
        doc.head.appendChild(style);
        // Auto-height so the whole page shows (no inner scrollbar).
        const resize = () => {
          const h = Math.max(
            doc.documentElement.scrollHeight,
            doc.body.scrollHeight,
          );
          iframe.style.height = h + 'px';
        };
        resize();
        if ('ResizeObserver' in window) {
          ro = new ResizeObserver(resize);
          ro.observe(doc.body);
        }
        // Catch late layout shifts (lottie load, reveal-on-scroll, carousel).
        timer = setInterval(resize, 800);
      } catch {
        /* cross-origin should never happen (same origin); ignore */
      }
    };

    iframe.addEventListener('load', onLoad);
    if (iframe.contentDocument?.readyState === 'complete') onLoad();
    return () => {
      iframe.removeEventListener('load', onLoad);
      ro?.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [slug]);

  return (
    <iframe
      ref={ref}
      src={`/_mock/${slug}-landing.html`}
      title=""
      loading="eager"
      style={{ width: '100%', border: 0, display: 'block', minHeight: '100vh' }}
    />
  );
}
