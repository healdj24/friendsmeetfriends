'use client';

import { useEffect, useRef, useState } from 'react';

const COLORS = ['#990000', '#006600', '#000099', '#996600', '#660066', '#009999'];

// Base velocity calibrated for 1400px desktop width
const BASE_SCREEN_WIDTH = 1400;
const BASE_VELOCITY_X = 1.125;
const BASE_VELOCITY_Y = 0.75;

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
  const [velocity, setVelocity] = useState({ x: BASE_VELOCITY_X, y: BASE_VELOCITY_Y });
  const [paused, setPaused] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [cornerHit, setCornerHit] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate viewport-relative velocity and detect mobile
  useEffect(() => {
    const updateVelocity = () => {
      const screenWidth = window.innerWidth;
      const mobile = screenWidth < 768;
      setIsMobile(mobile);

      // Scale velocity relative to screen width (same visual speed on all devices)
      const scale = screenWidth / BASE_SCREEN_WIDTH;
      setVelocity((prev) => ({
        x: Math.sign(prev.x) * BASE_VELOCITY_X * scale,
        y: Math.sign(prev.y) * BASE_VELOCITY_Y * scale,
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
