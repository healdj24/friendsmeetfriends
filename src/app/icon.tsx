import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  // Google-ish colors
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
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.10)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: -1,
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

