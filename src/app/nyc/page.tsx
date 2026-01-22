'use client';

import { useEffect, useRef, useState } from 'react';

const COLORS = ['#990000', '#006600', '#000099', '#996600', '#660066', '#009999'];

function SmileyFace() {
  return (
    <svg
      width="18"
      height="18"
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
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [velocity, setVelocity] = useState({ x: 2.25, y: 1.5 });
  const [colorIndex, setColorIndex] = useState(0);
  const [cornerHit, setCornerHit] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      if (!cardRef.current || !containerRef.current) {
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
          setTimeout(() => setCornerHit(false), 1000);
        }

        return { x: newX, y: newY };
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [velocity]);

  const currentColor = COLORS[colorIndex];

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
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          textAlign: 'center',
          padding: '30px',
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
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '16px',
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
            fontSize: '12px',
            marginBottom: '24px',
            lineHeight: '1.6',
            color: '#333',
          }}
        >
          for those who are generally down to clown
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              border: '2px solid',
              borderColor: '#888 #fff #fff #888',
              padding: '6px 12px',
              fontSize: '12px',
              fontFamily: 'Verdana, Arial, sans-serif',
              width: '160px',
              height: '28px',
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
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #666',
              boxSizing: 'border-box',
            }}
            title="Join us"
          >
            {status === 'loading' ? '...' : <SmileyFace />}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: '10px',
              fontSize: '11px',
              color: status === 'error' ? '#cc0000' : '#006600',
            }}
          >
            {message}
          </p>
        )}

        {cornerHit && (
          <div
            style={{
              marginTop: '10px',
              fontSize: '11px',
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
