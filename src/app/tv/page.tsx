'use client';

import { useState, useEffect } from 'react';

// Sample video playlist - replace with your own hosted videos
const videos = [
  { id: 1, src: '/videos/sample1.mp4', title: 'Summer in the City', date: 'JULY 1994', channel: 3 },
  { id: 2, src: '/videos/sample2.mp4', title: 'Central Park Picnic', date: 'AUG 1995', channel: 5 },
  { id: 3, src: '/videos/sample3.mp4', title: 'Rooftop Party', date: 'SEPT 1992', channel: 7 },
  { id: 4, src: '/videos/sample4.mp4', title: 'Street Fair', date: 'OCT 1993', channel: 9 },
  { id: 5, src: '/videos/sample5.mp4', title: 'Beach Day', date: 'JUNE 1996', channel: 11 },
];

// Scanlines overlay
function Scanlines() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}

// Static noise effect
function StaticNoise({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#111',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'staticMove 0.1s steps(10) infinite',
        }}
      />
      <style>{`
        @keyframes staticMove {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(5%, 5%); }
          30% { transform: translate(-5%, 5%); }
          40% { transform: translate(5%, -5%); }
          50% { transform: translate(-5%, 0); }
          60% { transform: translate(5%, 0); }
          70% { transform: translate(0, 5%); }
          80% { transform: translate(0, -5%); }
          90% { transform: translate(5%, 5%); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
}

// Channel display
function ChannelDisplay({ channel }: { channel: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        fontFamily: "'Courier New', monospace",
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#0f0',
        textShadow: '0 0 10px #0f0',
        zIndex: 15,
        padding: '4px 8px',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      CH {channel}
    </div>
  );
}

// TV Knob component
function TVKnob({ onClick, direction }: { onClick: () => void; direction: 'up' | 'down' }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #4a4a4a, #2a2a2a)',
        border: '2px solid #1a1a1a',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.5)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontSize: '18px',
        fontWeight: 'bold',
      }}
    >
      {direction === 'up' ? '▲' : '▼'}
    </button>
  );
}

export default function RetroTV() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const currentVideo = videos[currentIndex];

  const changeChannel = (direction: 'up' | 'down') => {
    setShowStatic(true);
    setTimeout(() => {
      if (direction === 'up') {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
      }
      setTimeout(() => setShowStatic(false), 300);
    }, 200);
  };

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
        setMessage("You're in!");
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

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        backgroundImage: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* TV SET */}
      <div
        style={{
          backgroundColor: '#8B4513',
          background: 'linear-gradient(180deg, #a0522d 0%, #8B4513 20%, #6b3510 100%)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        {/* TV Brand */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '8px',
            color: '#d4a574',
            fontSize: '12px',
            fontFamily: "'Arial', sans-serif",
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          FriendVision
        </div>

        {/* Screen bezel */}
        <div
          style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '15px',
            padding: '15px',
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {/* Screen */}
          <div
            style={{
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: '50px / 40px',
              overflow: 'hidden',
              aspectRatio: '4/3',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Video content */}
            <div
              style={{
                position: 'absolute',
                top: '5%',
                left: '3%',
                right: '3%',
                bottom: '5%',
                backgroundColor: '#1a1a1a',
                borderRadius: '40px / 30px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Placeholder for video - replace with actual video element */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#222',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📺</div>
                <div style={{ fontSize: '14px', textAlign: 'center', padding: '0 20px' }}>
                  {currentVideo.title}
                </div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '5px' }}>
                  Add video: {currentVideo.src}
                </div>
              </div>

              {/* Channel display */}
              <ChannelDisplay channel={currentVideo.channel} />

              {/* Timestamp */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '14px',
                  color: '#fff',
                  textShadow: '1px 1px 2px #000',
                  zIndex: 15,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: '2px 6px',
                }}
              >
                {currentVideo.date}
              </div>

              {/* Scanlines */}
              <Scanlines />

              {/* Static noise */}
              <StaticNoise visible={showStatic} />

              {/* Screen glare */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              />
            </div>
          </div>
        </div>

        {/* Control panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '15px',
            padding: '0 10px',
          }}
        >
          {/* Speaker grille */}
          <div
            style={{
              width: '80px',
              height: '60px',
              background: 'repeating-linear-gradient(0deg, #5a3d2a 0px, #5a3d2a 3px, #4a2d1a 3px, #4a2d1a 6px)',
              borderRadius: '5px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
            }}
          />

          {/* Channel knobs */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <TVKnob onClick={() => changeChannel('down')} direction="down" />
            <div style={{ color: '#d4a574', fontSize: '10px', textAlign: 'center' }}>
              CHANNEL
            </div>
            <TVKnob onClick={() => changeChannel('up')} direction="up" />
          </div>

          {/* Power indicator */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#0f0',
              boxShadow: '0 0 10px #0f0',
            }}
          />
        </div>
      </div>

      {/* Subscribe section */}
      <div
        style={{
          marginTop: '30px',
          textAlign: 'center',
          color: '#d4a574',
        }}
      >
        <h1
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '12px',
            color: '#f0d9b5',
          }}
        >
          Friends Doing Fun Things
        </h1>
        <p
          style={{
            fontSize: '12px',
            marginBottom: '16px',
            color: '#a08060',
          }}
        >
          Join the channel
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              border: '2px solid #5a3d2a',
              padding: '8px 12px',
              fontSize: '14px',
              fontFamily: "'Courier New', monospace",
              width: '180px',
              backgroundColor: '#2a2a2a',
              color: '#0f0',
              borderRadius: '4px',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              backgroundColor: '#5a3d2a',
              border: '2px solid #3a2d1a',
              padding: '8px 16px',
              color: '#f0d9b5',
              cursor: 'pointer',
              fontFamily: "'Georgia', serif",
              fontSize: '14px',
              borderRadius: '4px',
            }}
          >
            {status === 'loading' ? '...' : 'Tune In'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: '10px', fontSize: '12px', color: status === 'error' ? '#ff6b6b' : '#0f0' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
