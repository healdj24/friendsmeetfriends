'use client';

import { useEffect, useRef, useState } from 'react';

const COLORS = ['#990000', '#006600', '#000099', '#996600', '#660066', '#009999'];

// Screen width boundaries
const MOBILE_WIDTH = 375;
const DESKTOP_WIDTH = 1400;

// DVD screensaver runs at ~90px/s, at 60fps = 1.5px/frame
// Mobile speed: 20% faster than previous (was ~0.30, now ~0.36)
const MOBILE_VELOCITY_X = 0.36;
const MOBILE_VELOCITY_Y = 0.24;
const DESKTOP_VELOCITY_X = 1.5;  // DVD speed
const DESKTOP_VELOCITY_Y = 1.0;  // DVD speed (maintains 3:2 ratio)

function RetroTV({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* TV Body - Gray plastic frame */}
      <div style={{
        background: 'linear-gradient(160deg, #7a7a7a 0%, #5a5a5a 50%, #4a4a4a 100%)',
        padding: '20px',
        borderRadius: '20px',
        boxShadow: `
          inset 0 2px 4px rgba(255,255,255,0.3),
          inset 0 -3px 6px rgba(0,0,0,0.4),
          4px 4px 15px rgba(0,0,0,0.6)
        `,
        border: '3px solid #333',
      }}>
        {/* Inner black bezel */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '8px',
          borderRadius: '12px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
          border: '2px solid #000',
        }}>
          {/* CRT Screen container - creates the curved clip effect */}
          <div style={{
            borderRadius: '8px / 40px',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#0a0a0a',
          }}>
            {/* Screen glare - white streak in top left like the image */}
            <div style={{
              position: 'absolute',
              top: '8%',
              left: '8%',
              width: '20%',
              height: '3px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              transform: 'rotate(-50deg)',
              pointerEvents: 'none',
              zIndex: 10,
              borderRadius: '2px',
            }} />

            {/* Secondary glare line */}
            <div style={{
              position: 'absolute',
              top: '12%',
              left: '5%',
              width: '8%',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
              transform: 'rotate(-50deg)',
              pointerEvents: 'none',
              zIndex: 10,
              borderRadius: '2px',
            }} />

            {/* Screen curve darkening at edges */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: `
                radial-gradient(ellipse 100% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.3) 100%)
              `,
              pointerEvents: 'none',
              zIndex: 5,
              borderRadius: '8px / 40px',
            }} />

            {/* Subtle blue tint overlay like old CRTs */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'linear-gradient(180deg, rgba(100,180,200,0.08) 0%, rgba(80,150,180,0.05) 100%)',
              pointerEvents: 'none',
              zIndex: 4,
              borderRadius: '8px / 40px',
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Close button - small and subtle */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'linear-gradient(145deg, #555 0%, #333 100%)',
          border: '2px solid #222',
          borderRadius: '50%',
          width: '22px',
          height: '22px',
          fontSize: '12px',
          cursor: 'pointer',
          color: '#aaa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 2px 2px 4px rgba(0,0,0,0.4)',
        }}
        title="Close"
      >
        ✕
      </button>
    </div>
  );
}

function SmileyFace({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <circle cx="8" cy="9" r="2" fill="currentColor" />
      <circle cx="16" cy="9" r="2" fill="currentColor" />
      <path
        d="M6.5 14c1.5 2.5 4 4 6 4 2 0 4.5-1.5 6-4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function NYC() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [velocity, setVelocity] = useState({ x: DESKTOP_VELOCITY_X, y: DESKTOP_VELOCITY_Y });
  const [paused, setPaused] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [cornerHit, setCornerHit] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSnowfall, setShowSnowfall] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate velocity with linear interpolation from mobile to desktop
  useEffect(() => {
    const updateVelocity = () => {
      const screenWidth = window.innerWidth;
      const mobile = screenWidth < 768;
      setIsMobile(mobile);

      // Clamp screen width to boundaries
      const clampedWidth = Math.max(MOBILE_WIDTH, Math.min(DESKTOP_WIDTH, screenWidth));

      // Linear interpolation: 0 at mobile, 1 at desktop
      const t = (clampedWidth - MOBILE_WIDTH) / (DESKTOP_WIDTH - MOBILE_WIDTH);

      // Interpolate between mobile and desktop velocities
      const velocityX = MOBILE_VELOCITY_X + (DESKTOP_VELOCITY_X - MOBILE_VELOCITY_X) * t;
      const velocityY = MOBILE_VELOCITY_Y + (DESKTOP_VELOCITY_Y - MOBILE_VELOCITY_Y) * t;

      setVelocity((prev) => ({
        x: Math.sign(prev.x) * velocityX,
        y: Math.sign(prev.y) * velocityY,
      }));
    };

    updateVelocity();
    window.addEventListener('resize', updateVelocity);
    return () => window.removeEventListener('resize', updateVelocity);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('You\'re in!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong');
    }
  };

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      if (!cardRef.current || !containerRef.current || paused) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const card = cardRef.current.getBoundingClientRect();
      const container = containerRef.current.getBoundingClientRect();

      const cardWidth = card.width;
      const cardHeight = card.height;
      const maxX = container.width - cardWidth;
      const maxY = container.height - cardHeight;

      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelX = velocity.x;
        let newVelY = velocity.y;
        let bounced = false;
        let hitCorner = false;

        // Check horizontal bounds
        if (newX <= 0) {
          newX = 0;
          newVelX = Math.abs(velocity.x);
          bounced = true;
        } else if (newX >= maxX) {
          newX = maxX;
          newVelX = -Math.abs(velocity.x);
          bounced = true;
        }

        // Check vertical bounds
        if (newY <= 0) {
          newY = 0;
          newVelY = Math.abs(velocity.y);
          bounced = true;
        } else if (newY >= maxY) {
          newY = maxY;
          newVelY = -Math.abs(velocity.y);
          bounced = true;
        }

        // Check for corner hit
        if ((newX <= 0 || newX >= maxX) && (newY <= 0 || newY >= maxY)) {
          hitCorner = true;
        }

        if (bounced) {
          setVelocity({ x: newVelX, y: newVelY });
          setColorIndex((prev) => (prev + 1) % COLORS.length);
        }

        if (hitCorner) {
          setCornerHit(true);
          setTimeout(() => setCornerHit(false), 3000);
        }

        return { x: newX, y: newY };
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [velocity, paused]);

  const currentColor = COLORS[colorIndex];

  // Responsive styles
  const cardPadding = isMobile ? '16px' : '30px';
  const titleSize = isMobile ? '11px' : '14px';
  const subtitleSize = isMobile ? '10px' : '12px';
  const inputWidth = isMobile ? '120px' : '160px';
  const inputHeight = isMobile ? '24px' : '28px';
  const buttonSize = isMobile ? '24px' : '28px';
  const inputFontSize = isMobile ? '10px' : '12px';

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
          opacity: 0.6,
        }}
      >
        <source src="/casey.mp4" type="video/mp4" />
      </video>

      {/* Snowfall Popup - behind bouncing card, in front of video */}
      {showSnowfall && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
          }}
        >
          <RetroTV onClose={() => setShowSnowfall(false)}>
            <div style={{ position: 'relative', minWidth: isMobile ? '200px' : '400px', minHeight: isMobile ? '150px' : '300px' }}>
              {imageLoading && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#666',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}>
                  Loading forecast...
                </div>
              )}
              <img
                src="/api/snowfall"
                alt="Expected Snowfall"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  console.error('Snowfall image failed to load:', e);
                  setImageLoading(false);
                }}
                style={{
                  maxWidth: isMobile ? '75vw' : '450px',
                  height: 'auto',
                  display: 'block',
                  opacity: imageLoading ? 0 : 1,
                  transition: 'opacity 0.3s',
                }}
              />
            </div>
          </RetroTV>
        </div>
      )}

      {/* Bouncing Card */}
      <div
        ref={cardRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          zIndex: 10,
          textAlign: 'center',
          padding: cardPadding,
          backgroundColor: cornerHit ? '#FFD700' : 'rgba(255, 255, 248, 0.95)',
          border: `3px solid ${currentColor}`,
          boxShadow: cornerHit
            ? '0 0 30px #FFD700, 0 0 60px #FFD700'
            : `4px 4px 0px ${currentColor}`,
          fontFamily: 'Verdana, Arial, sans-serif',
          transition: 'background-color 0.3s, box-shadow 0.3s',
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        <h1
          style={{
            fontSize: titleSize,
            fontWeight: 'bold',
            marginBottom: isMobile ? '10px' : '16px',
            color: currentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: "Georgia, 'Times New Roman', Times, serif",
            transition: 'color 0.3s',
          }}
        >
          Friends Doing Fun Things
        </h1>

        <p
          style={{
            fontSize: subtitleSize,
            marginBottom: isMobile ? '14px' : '24px',
            lineHeight: '1.6',
            color: '#333',
          }}
        >
          for those who are generally down to clown
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: isMobile ? '6px' : '8px', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              border: '2px solid',
              borderColor: '#888 #fff #fff #888',
              padding: isMobile ? '4px 8px' : '6px 12px',
              fontSize: inputFontSize,
              fontFamily: 'Verdana, Arial, sans-serif',
              width: inputWidth,
              height: inputHeight,
              boxSizing: 'border-box',
              boxShadow: '2px 2px 0px #666',
              backgroundColor: '#fff',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              border: '2px solid',
              borderColor: '#fff #888 #888 #fff',
              backgroundColor: '#c9c9ff',
              padding: '0',
              width: buttonSize,
              height: buttonSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #666',
              boxSizing: 'border-box',
            }}
            title="Join us"
          >
            {status === 'loading' ? '...' : <SmileyFace size={isMobile ? 14 : 18} />}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: isMobile ? '8px' : '10px',
              fontSize: isMobile ? '9px' : '11px',
              color: status === 'error' ? '#cc0000' : '#006600',
            }}
          >
            {message}
          </p>
        )}

        {cornerHit && (
          <div
            style={{
              marginTop: isMobile ? '8px' : '10px',
              fontSize: isMobile ? '9px' : '11px',
              color: '#996600',
              fontWeight: 'bold',
              animation: 'pulse 0.5s ease-in-out',
            }}
          >
            🎉 CORNER HIT! 🎉
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
