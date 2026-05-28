import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAFAF8',
          fontSize: 116,
          fontWeight: 800,
          letterSpacing: '-0.04em',
        }}
      >
        <span style={{ color: '#1A1A1A' }}>H</span>
        <span style={{ color: '#10B981' }}>.</span>
      </div>
    ),
    { ...size },
  );
}
