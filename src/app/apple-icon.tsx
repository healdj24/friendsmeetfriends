import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const BLUE = '#4285F4';
  const RED = '#DB4437';
  const YELLOW = '#F4B400';
  const GREEN = '#0F9D58';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderRadius: 42,
          boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontWeight: 900,
            fontSize: 96,
            letterSpacing: -6,
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            lineHeight: 1,
          }}
        >
          <span style={{ color: BLUE }}>F</span>
          <span style={{ color: RED }}>D</span>
          <span style={{ color: YELLOW }}>F</span>
          <span style={{ color: GREEN }}>T</span>
        </div>
      </div>
    ),
    size
  );
}

