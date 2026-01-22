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

function RetroTV({ children, onClose, borderColor, isMobile, onDragStart, isDragging }: { children: React.ReactNode; onClose: () => void; borderColor: string; isMobile: boolean; onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void; isDragging?: boolean }) {
  return (
    <div
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      style={{
        position: 'relative',
        width: isMobile ? '320px' : '400px',
        maxWidth: '85vw',
        background: `linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 50%, #2a2a2a 100%)`,
        border: `6px solid ${borderColor}`,
        borderRadius: '12px',
        boxShadow: `
          inset 2px 2px 4px rgba(255,255,255,0.1),
          inset -2px -2px 4px rgba(0,0,0,0.3),
          6px 6px 0px ${borderColor},
          8px 8px 20px rgba(0,0,0,0.6)
        `,
        padding: '16px',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}>
      {/* Inner bezel for depth */}
      <div style={{
        border: '3px solid',
        borderColor: '#444 #222 #222 #444',
        borderRadius: '10px',
        padding: '8px',
        background: 'linear-gradient(180deg, #333 0%, #1a1a1a 100%)',
      }}>
        {/* Screen area */}
        <div style={{
          backgroundColor: '#000',
          borderRadius: '6px',
          overflow: 'hidden',
          aspectRatio: '4/3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
        }}>
          {children}
        </div>
      </div>

      {/* Power button embedded in TV frame */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: borderColor,
          border: '2px solid #333',
          boxShadow: `
            inset 1px 1px 2px rgba(255,255,255,0.3),
            inset -1px -1px 2px rgba(0,0,0,0.4),
            0 1px 3px rgba(0,0,0,0.5)
          `,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          transition: 'background 0.3s',
        }}
        title="Power off"
      >
        {/* Power icon */}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="10" />
          <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
        </svg>
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
  const [hasMounted, setHasMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState({ x: 50, y: 9999 }); // Start bottom-left (y clamped by animation)
  const [velocity, setVelocity] = useState({ x: DESKTOP_VELOCITY_X, y: -DESKTOP_VELOCITY_Y }); // Negative y = moving up
  const [paused, setPaused] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [cornerHit, setCornerHit] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSnowfall, setShowSnowfall] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const snowfallImgRef = useRef<HTMLImageElement>(null);
  const [tvPosition, setTvPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingTv, setIsDraggingTv] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHasMounted(true);
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

  // TV dragging handlers
  useEffect(() => {
    if (!isDraggingTv) return;

    const handleMouseMove = (e: MouseEvent) => {
      setTvPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent iOS Safari rubber-band scrolling
      const touch = e.touches[0];
      setTvPosition({
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y,
      });
    };

    const handleEnd = () => {
      setIsDraggingTv(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false }); // passive: false required for preventDefault
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingTv, dragOffset]);

  const handleTvDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!tvRef.current) return;
    const rect = tvRef.current.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    setTvPosition({ x: rect.left, y: rect.top });
    setIsDraggingTv(true);
  };

  // Check if snowfall image is already loaded (handles cached images)
  useEffect(() => {
    const img = snowfallImgRef.current;
    if (img?.complete && img?.naturalHeight > 0) {
      setImageLoading(false);
    }
    // Fallback: if still loading after 10s, hide the loading text anyway
    const timeout = setTimeout(() => setImageLoading(false), 10000);
    return () => clearTimeout(timeout);
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
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/casey-poster.jpg"
        onCanPlay={() => {
          // Ensure video plays even if autoplay was blocked
          videoRef.current?.play().catch(() => {});
        }}
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
      {hasMounted && showSnowfall && (
        <div
          ref={tvRef}
          style={{
            position: 'absolute',
            ...(tvPosition
              ? { left: tvPosition.x, top: tvPosition.y }
              : { top: '20px', right: '20px' }
            ),
            zIndex: 5,
            touchAction: 'none', // Prevent browser from handling touch gestures
          }}
        >
          <RetroTV onClose={() => setShowSnowfall(false)} borderColor={currentColor} isMobile={isMobile} onDragStart={handleTvDragStart} isDragging={isDraggingTv}>
            {imageLoading && (
              <div style={{
                position: 'absolute',
                color: '#888',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}>
                Loading...
              </div>
            )}
            <img
              ref={snowfallImgRef}
              src="/api/snowfall"
              alt="Expected Snowfall"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
                opacity: imageLoading ? 0 : 1,
                transition: 'opacity 0.3s',
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
