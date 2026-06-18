'use client';

import Image from 'next/image';

const logos = [
  { src: '/logos/claude.png',      alt: 'Claude',      ext: 'png' },
  { src: '/logos/cursor.png',      alt: 'Cursor',      ext: 'png' },
  { src: '/logos/figma.png',       alt: 'Figma',       ext: 'png' },
  { src: '/logos/make.png',        alt: 'Make',        ext: 'png' },
  { src: '/logos/n8n.png',         alt: 'n8n',         ext: 'png' },
  { src: '/logos/zapier.png',      alt: 'Zapier',      ext: 'png' },
  { src: '/logos/meta.png',        alt: 'Meta',        ext: 'png' },
  { src: '/logos/google-ads.png',  alt: 'Google Ads',  ext: 'png' },
  { src: '/logos/semrush.png',     alt: 'SEMrush',     ext: 'png' },
  { src: '/logos/wordpress.png',   alt: 'WordPress',   ext: 'png' },
  { src: '/logos/shopify.png',     alt: 'Shopify',     ext: 'png' },
  { src: '/logos/hubspot.png',     alt: 'HubSpot',     ext: 'png' },
  { src: '/logos/openai.png',      alt: 'OpenAI',      ext: 'png' },
  { src: '/logos/canva.png',       alt: 'Canva',       ext: 'png' },
  { src: '/logos/tiktok.png',      alt: 'TikTok',      ext: 'png' },
  { src: '/logos/linkedin.png',    alt: 'LinkedIn',    ext: 'png' },
  { src: '/logos/gemini.png',      alt: 'Gemini',      ext: 'png' },
  { src: '/logos/ahrefs.png',      alt: 'Ahrefs',      ext: 'png' },
  { src: '/logos/apollo.png',      alt: 'Apollo',      ext: 'png' },
  { src: '/logos/aws.png',         alt: 'AWS',         ext: 'png' },
  { src: '/logos/github.png',      alt: 'GitHub',      ext: 'png' },
  { src: '/logos/hotjar.png',      alt: 'Hotjar',      ext: 'png' },
  { src: '/logos/nextjs.png',      alt: 'Next.js',     ext: 'png' },
  { src: '/logos/woocommerce.png', alt: 'WooCommerce', ext: 'png' },
  { src: '/logos/gcp.png',         alt: 'GCP',         ext: 'png' },
  { src: '/logos/python.png',      alt: 'Python',      ext: 'png' },
];

// Spread across full viewport — varied positions, sizes, speeds
const positions = [
  { top:  '4%', left:  '3%',  size: 36, dur: 7.2,  delay: 0,   opacity: 0.18 },
  { top:  '9%', left: '22%',  size: 30, dur: 9.1,  delay: 1.3, opacity: 0.13 },
  { top:  '6%', left: '45%',  size: 40, dur: 6.8,  delay: 2.7, opacity: 0.16 },
  { top:  '3%', left: '68%',  size: 32, dur: 8.4,  delay: 0.5, opacity: 0.14 },
  { top:  '8%', left: '87%',  size: 38, dur: 7.6,  delay: 3.1, opacity: 0.17 },
  { top: '22%', left:  '8%',  size: 34, dur: 10.2, delay: 1.8, opacity: 0.12 },
  { top: '18%', left: '33%',  size: 28, dur: 8.9,  delay: 0.2, opacity: 0.11 },
  { top: '25%', left: '58%',  size: 42, dur: 7.4,  delay: 4.0, opacity: 0.15 },
  { top: '20%', left: '78%',  size: 36, dur: 9.6,  delay: 2.2, opacity: 0.13 },
  { top: '20%', left: '94%',  size: 30, dur: 6.5,  delay: 1.0, opacity: 0.16 },
  { top: '38%', left:  '1%',  size: 38, dur: 8.2,  delay: 3.5, opacity: 0.14 },
  { top: '42%', left: '18%',  size: 32, dur: 7.8,  delay: 0.8, opacity: 0.12 },
  { top: '35%', left: '42%',  size: 26, dur: 11.0, delay: 2.4, opacity: 0.10 },
  { top: '40%', left: '65%',  size: 40, dur: 8.6,  delay: 1.6, opacity: 0.15 },
  { top: '36%', left: '88%',  size: 34, dur: 7.1,  delay: 4.3, opacity: 0.13 },
  { top: '55%', left:  '6%',  size: 30, dur: 9.4,  delay: 0.4, opacity: 0.12 },
  { top: '58%', left: '26%',  size: 38, dur: 7.9,  delay: 2.9, opacity: 0.16 },
  { top: '52%', left: '50%',  size: 32, dur: 8.7,  delay: 1.1, opacity: 0.11 },
  { top: '60%', left: '73%',  size: 44, dur: 6.3,  delay: 3.7, opacity: 0.17 },
  { top: '56%', left: '91%',  size: 28, dur: 10.5, delay: 0.7, opacity: 0.12 },
  { top: '72%', left:  '2%',  size: 36, dur: 8.1,  delay: 2.1, opacity: 0.14 },
  { top: '75%', left: '20%',  size: 40, dur: 7.5,  delay: 4.6, opacity: 0.15 },
  { top: '70%', left: '44%',  size: 30, dur: 9.2,  delay: 1.4, opacity: 0.11 },
  { top: '78%', left: '66%',  size: 36, dur: 7.3,  delay: 3.2, opacity: 0.13 },
  { top: '74%', left: '86%',  size: 34, dur: 8.8,  delay: 0.9, opacity: 0.16 },
  { top: '88%', left: '10%',  size: 32, dur: 6.9,  delay: 2.6, opacity: 0.12 },
];

export default function FloatingLogos() {
  return (
    <div className="floating-logos-bg" aria-hidden="true">
      {logos.map((logo, i) => {
        const p = positions[i];
        if (!p) return null;
        return (
          <div
            key={logo.alt}
            className="floating-logo-item"
            style={{
              top: p.top,
              left: p.left,
              opacity: p.opacity,
              animationDuration: `${p.dur}s`,
              animationDelay: `-${p.delay}s`,
            }}
          >
            <Image src={logo.src} alt={logo.alt} width={p.size} height={p.size} />
          </div>
        );
      })}
    </div>
  );
}
