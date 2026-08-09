import { ImageResponse } from 'next/og';

// Social share card (Open Graph / Twitter) — HELIX. wordmark on brand-dark.
// Rendered statically at build so it works under `output: export` too.
export const alt = 'HELIX. — פיתוח וצמיחה לעסקים ישראלים';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

// Fetch Heebo (the brand font) from Google Fonts at build time. Requesting
// without a browser UA makes Google return TTF, which Satori/next-og needs.
async function heebo(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Heebo:wght@${weight}`).then((r) => r.text());
    const url = css.match(/src:\s*url\((https:[^)]+)\)\s*format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const black = await heebo(900);
  const fonts = black
    ? [{ name: 'Heebo', data: black, weight: 900 as const, style: 'normal' as const }]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          background: '#121413',
          padding: '0 96px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'Heebo', fontWeight: 900, fontSize: 236, letterSpacing: -9, color: '#FFFFFF' }}>
            HELIX
          </span>
          <span style={{ fontFamily: 'Heebo', fontWeight: 900, fontSize: 236, letterSpacing: -9, color: '#10B981' }}>
            .
          </span>
        </div>
      </div>
    ),
    { ...size, ...(fonts ? { fonts } : {}) },
  );
}
