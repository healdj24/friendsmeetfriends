'use client';

import { useState, useEffect } from 'react';

// Option 1: Exact aspect ratio matching
// Screen area measured: approximately 855x680 pixels in 1024x1024 frame
// That's roughly 83% width, 66% height, aspect ratio ~1.26:1
function TVOption1({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', width: '400px', height: '400px' }}>
      {/* Content container with exact screen aspect ratio */}
      <div style={{
        position: 'absolute',
        top: '7.3%',    // 75px / 1024
        left: '8.3%',   // 85px / 1024
        width: '83.5%', // 855px / 1024
        height: '66.4%', // 680px / 1024
        overflow: 'hidden',
        borderRadius: '3%',
        zIndex: 1,
      }}>
        {children}
      </div>

      {/* TV Frame on top */}
      <img
        src="/tvframe.png"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// Option 2: CSS Mask approach
// Uses an SVG mask where white = visible, black = hidden
function TVOption2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', width: '400px', height: '400px' }}>
      {/* Content with mask applied */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        WebkitMaskImage: 'url(/tvframe-mask.svg)',
        WebkitMaskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskImage: 'url(/tvframe-mask.svg)',
        maskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        zIndex: 1,
      }}>
        {children}
      </div>

      {/* TV Frame on top */}
      <img
        src="/tvframe.png"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// Option 3: Clip-path approach
// Define the screen shape as inset with rounded corners
function TVOption3({ children }: { children: React.ReactNode }) {
  // inset(top right bottom left round border-radius)
  // Based on 1024x1024 frame: screen at x=85, y=75, width=855, height=680
  // top = 75/1024 = 7.3%, right = (1024-85-855)/1024 = 8.2%, bottom = (1024-75-680)/1024 = 26.3%, left = 8.3%
  const clipPath = `inset(7.3% 8.2% 26.3% 8.3% round 12px)`;

  return (
    <div style={{ position: 'relative', width: '400px', height: '400px' }}>
      {/* Content with clip-path */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        clipPath: clipPath,
        zIndex: 1,
      }}>
        {children}
      </div>

      {/* TV Frame on top */}
      <img
        src="/tvframe.png"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// Test content component
function TestContent() {
  return (
    <img
      src="/api/snowfall"
      alt="Snowfall"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top center',
      }}
    />
  );
}

export default function TVTest() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '60px',
    }}>
      <h1 style={{ color: '#fff', fontFamily: 'system-ui', marginBottom: '20px' }}>
        TV Frame Options Comparison
      </h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Option 1 */}
        <div>
          <h2 style={{ color: '#fff', fontFamily: 'system-ui', marginBottom: '10px' }}>
            Option 1: Aspect Ratio Matching
          </h2>
          <p style={{ color: '#888', fontFamily: 'system-ui', marginBottom: '20px', maxWidth: '400px' }}>
            Container matches screen aspect ratio (~1.35:1). Content fills with object-fit: cover.
          </p>
          {loaded && (
            <TVOption1>
              <TestContent />
            </TVOption1>
          )}
        </div>

        {/* Option 2 */}
        <div>
          <h2 style={{ color: '#fff', fontFamily: 'system-ui', marginBottom: '10px' }}>
            Option 2: CSS Mask
          </h2>
          <p style={{ color: '#888', fontFamily: 'system-ui', marginBottom: '20px', maxWidth: '400px' }}>
            Uses mask image to clip content to exact screen shape. (Needs tvframe-mask.png)
          </p>
          {loaded && (
            <TVOption2>
              <TestContent />
            </TVOption2>
          )}
        </div>

        {/* Option 3 */}
        <div>
          <h2 style={{ color: '#fff', fontFamily: 'system-ui', marginBottom: '10px' }}>
            Option 3: CSS Clip-Path
          </h2>
          <p style={{ color: '#888', fontFamily: 'system-ui', marginBottom: '20px', maxWidth: '400px' }}>
            Uses CSS inset() clip-path to define screen area as rounded rectangle.
          </p>
          {loaded && (
            <TVOption3>
              <TestContent />
            </TVOption3>
          )}
        </div>
      </div>

      <div style={{ color: '#666', fontFamily: 'system-ui', marginTop: '40px' }}>
        <p>Note: Option 2 requires a mask image (tvframe-mask.png) where:</p>
        <ul>
          <li>White = screen area (visible)</li>
          <li>Black/transparent = frame area (hidden)</li>
        </ul>
      </div>
    </div>
  );
}
