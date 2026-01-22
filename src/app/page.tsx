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
  // Wood grain texture using CSS
  const woodGrain = `
    linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%),
    linear-gradient(90deg,
      #8B5A2B 0%, #7A4E24 10%, #8B5A2B 20%, #9B6A3B 30%,
      #8B5A2B 40%, #7A4E24 55%, #8B5A2B 70%, #9B6A3B 85%, #8B5A2B 100%
    )
  `;

  return (
    <div style={{ position: 'relative', paddingTop: '70px' }}>
      {/* Rabbit ear antennas */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '120px',
        height: '70px',
      }}>
        {/* Left antenna */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '25px',
          width: '5px',
          height: '65px',
          background: 'linear-gradient(90deg, #666 0%, #888 50%, #555 100%)',
          borderRadius: '2px',
          transform: 'rotate(-30deg)',
          transformOrigin: 'bottom center',
          boxShadow: '1px 1px 3px rgba(0,0,0,0.4)',
        }}>
          {/* Chrome ball tip */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '-5px',
            width: '14px',
            height: '14px',
            background: 'radial-gradient(circle at 30% 30%, #eee 0%, #999 50%, #666 100%)',
            borderRadius: '50%',
            boxShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }} />
        </div>
        {/* Right antenna */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '25px',
          width: '5px',
          height: '65px',
          background: 'linear-gradient(90deg, #555 0%, #888 50%, #666 100%)',
          borderRadius: '2px',
          transform: 'rotate(30deg)',
          transformOrigin: 'bottom center',
          boxShadow: '-1px 1px 3px rgba(0,0,0,0.4)',
        }}>
          {/* Chrome ball tip */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '-5px',
            width: '14px',
            height: '14px',
            background: 'radial-gradient(circle at 30% 30%, #eee 0%, #999 50%, #666 100%)',
            borderRadius: '50%',
            boxShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }} />
        </div>
        {/* Antenna base/mount */}
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '30px',
          height: '16px',
          background: 'linear-gradient(180deg, #444 0%, #222 100%)',
          borderRadius: '6px 6px 0 0',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
        }} />
      </div>

      {/* TV Cabinet - Main body with wood grain */}
      <div style={{
        display: 'flex',
        background: woodGrain,
        padding: '18px',
        borderRadius: '24px',
        boxShadow: `
          inset 0 2px 4px rgba(255,255,255,0.25),
          inset 0 -3px 6px rgba(0,0,0,0.4),
          6px 6px 20px rgba(0,0,0,0.6),
          0 0 0 3px #5D3A1A
        `,
        border: '4px solid #6B4423',
      }}>
        {/* Left side - Screen area */}
        <div style={{ flex: 1 }}>
          {/* Chrome trim around screen */}
          <div style={{
            background: 'linear-gradient(180deg, #d4af37 0%, #b8962e 50%, #8b7023 100%)',
            padding: '4px',
            borderRadius: '16px',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.3)',
          }}>
            {/* Thick dark bezel */}
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '14px',
              borderRadius: '12px',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9), inset 0 0 10px rgba(0,0,0,0.5)',
            }}>
              {/* CRT Screen with curve effect */}
              <div style={{
                backgroundColor: '#0a0a0a',
                borderRadius: '10px / 12px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: `
                  inset 0 0 60px rgba(0,0,0,0.8),
                  inset 0 0 20px rgba(255,255,255,0.03),
                  0 0 0 2px #333
                `,
              }}>
                {/* Screen bulge/curve highlight */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: `
                    radial-gradient(ellipse 120% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%),
                    linear-gradient(160deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)
                  `,
                  pointerEvents: 'none',
                  zIndex: 3,
                  borderRadius: '10px',
                }} />
                {/* Screen glare - that classic CRT reflection */}
                <div style={{
                  position: 'absolute',
                  top: '5%',
                  left: '5%',
                  width: '35%',
                  height: '25%',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                  pointerEvents: 'none',
                  zIndex: 4,
                  borderRadius: '50% 30% 50% 30%',
                }} />
                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Control panel */}
        <div style={{
          width: '80px',
          marginLeft: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingTop: '10px',
          paddingBottom: '10px',
        }}>
          {/* Channel knob */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              margin: '0 auto',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 50%, #2a2a2a 100%)',
              boxShadow: `
                inset 0 2px 4px rgba(255,255,255,0.1),
                inset 0 -2px 4px rgba(0,0,0,0.5),
                2px 3px 6px rgba(0,0,0,0.5),
                0 0 0 3px #444
              `,
              position: 'relative',
            }}>
              {/* Chrome ring */}
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
                right: '5px',
                bottom: '5px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: '#888 #666 #555 #777',
              }} />
              {/* Knob indicator line */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '50%',
                width: '3px',
                height: '12px',
                backgroundColor: '#ddd',
                transform: 'translateX(-50%) rotate(-30deg)',
                transformOrigin: 'bottom center',
                borderRadius: '2px',
              }} />
              {/* Channel numbers around knob */}
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  fontSize: '6px',
                  color: '#8B5A2B',
                  fontWeight: 'bold',
                  transform: `rotate(${i * 30 - 90}deg) translateY(-32px)`,
                  transformOrigin: '0 0',
                }}>
                  {i === 0 ? '' : i + 1}
                </div>
              ))}
            </div>
            <div style={{
              fontSize: '7px',
              color: '#2a1a0a',
              marginTop: '4px',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Channel
            </div>
          </div>

          {/* Volume knob */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '45px',
              height: '45px',
              margin: '0 auto',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 50%, #2a2a2a 100%)',
              boxShadow: `
                inset 0 2px 4px rgba(255,255,255,0.1),
                inset 0 -2px 4px rgba(0,0,0,0.5),
                2px 3px 6px rgba(0,0,0,0.5),
                0 0 0 3px #444
              `,
              position: 'relative',
            }}>
              {/* Chrome ring */}
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                right: '4px',
                bottom: '4px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: '#888 #666 #555 #777',
              }} />
              {/* Knob indicator */}
              <div style={{
                position: 'absolute',
                top: '7px',
                left: '50%',
                width: '3px',
                height: '10px',
                backgroundColor: '#ddd',
                transform: 'translateX(-50%) rotate(45deg)',
                transformOrigin: 'bottom center',
                borderRadius: '2px',
              }} />
            </div>
            <div style={{
              fontSize: '7px',
              color: '#2a1a0a',
              marginTop: '4px',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Volume
            </div>
          </div>

          {/* Speaker grille */}
          <div style={{
            marginTop: '8px',
            padding: '6px',
            backgroundColor: '#2a1a0a',
            borderRadius: '6px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
          }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                height: '3px',
                backgroundColor: '#1a0a00',
                marginBottom: i < 7 ? '3px' : 0,
                borderRadius: '1px',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Brand badge */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '28px',
        fontSize: '8px',
        color: '#d4af37',
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
        letterSpacing: '2px',
      }}>
        FDFT
      </div>

      {/* Close button styled as power button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '78px',
          right: '12px',
          background: 'linear-gradient(145deg, #4a4a4a 0%, #2a2a2a 100%)',
          border: '2px solid #555',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '10px',
          cursor: 'pointer',
          color: '#ff4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 2px 2px 4px rgba(0,0,0,0.4)',
        }}
        title="Power Off"
      >
        ⏻
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
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refresh snowfall image every hour
  useEffect(() => {
    const interval = setInterval(() => {
      setImageTimestamp(Date.now());
    }, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, []);

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
            <img
              src={`/api/snowfall?t=${imageTimestamp}`}
              alt="Expected Snowfall"
              style={{
                maxWidth: isMobile ? '75vw' : '450px',
                height: 'auto',
                display: 'block',
              }}
            />
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
