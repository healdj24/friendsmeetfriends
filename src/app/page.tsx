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
            backgroundColor: 'rgba(255, 255, 248, 0.95)',
            border: '3px solid #000099',
            boxShadow: '4px 4px 0px #000099',
            padding: isMobile ? '12px' : '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setShowSnowfall(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 4px',
              color: '#666',
            }}
            title="Close"
          >
            ✕
          </button>
          <img
            src={`https://www.weather.gov/images/okx/winter/SnowAmt6hr1.jpg?t=${imageTimestamp}`}
            alt="Expected Snowfall"
            style={{
              maxWidth: isMobile ? '85vw' : '500px',
              height: 'auto',
              borderRadius: '4px',
            }}
          />
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
