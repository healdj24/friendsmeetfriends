'use client';

import { useState, useEffect } from 'react';

// Sample video playlist - replace with your own hosted videos
const videos = [
  { id: 1, src: '/videos/sample1.mp4', title: 'Summer in the City', date: 'JUL 15 1994', time: '2:34 PM' },
  { id: 2, src: '/videos/sample2.mp4', title: 'Central Park Picnic', date: 'AUG 22 1995', time: '11:15 AM' },
  { id: 3, src: '/videos/sample3.mp4', title: 'Rooftop Party', date: 'SEP 08 1992', time: '8:47 PM' },
  { id: 4, src: '/videos/sample4.mp4', title: 'Street Fair', date: 'OCT 31 1993', time: '4:20 PM' },
  { id: 5, src: '/videos/sample5.mp4', title: 'Beach Day', date: 'JUN 04 1996', time: '1:03 PM' },
  { id: 6, src: '/videos/sample6.mp4', title: 'Birthday Party', date: 'MAR 17 1991', time: '6:30 PM' },
  { id: 7, src: '/videos/sample7.mp4', title: 'Road Trip', date: 'AUG 01 1994', time: '9:22 AM' },
  { id: 8, src: '/videos/sample8.mp4', title: 'Backyard BBQ', date: 'JUL 04 1995', time: '3:45 PM' },
];

// REC indicator with blinking dot
function RecIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
        fontSize: '14px',
        color: '#fff',
        textShadow: '2px 2px 0 #000',
      }}
    >
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: visible ? '#ff0000' : '#660000',
          boxShadow: visible ? '0 0 8px #ff0000' : 'none',
        }}
      />
      <span>REC</span>
    </div>
  );
}

// Battery indicator
function BatteryIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
        fontSize: '12px',
        color: '#fff',
        textShadow: '2px 2px 0 #000',
      }}
    >
      <div
        style={{
          width: '24px',
          height: '12px',
          border: '2px solid #fff',
          borderRadius: '2px',
          position: 'relative',
          display: 'flex',
          padding: '1px',
          gap: '1px',
        }}
      >
        <div style={{ flex: 1, backgroundColor: '#0f0' }} />
        <div style={{ flex: 1, backgroundColor: '#0f0' }} />
        <div style={{ flex: 1, backgroundColor: '#0f0' }} />
        <div
          style={{
            position: 'absolute',
            right: '-4px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '6px',
            backgroundColor: '#fff',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>
    </div>
  );
}

// VHS tracking lines effect
function TrackingLines({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            top: `${10 + i * 12}%`,
            animation: `trackingLine 0.15s ease-in-out ${i * 0.02}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes trackingLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// Static/noise effect for transitions
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
        zIndex: 25,
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'vhsStatic 0.08s steps(8) infinite',
          opacity: 0.9,
        }}
      />
      {/* Blue horizontal lines like bad tracking */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '20px',
            background: 'linear-gradient(transparent, rgba(0,100,255,0.3), transparent)',
            top: `${20 + i * 15}%`,
            animation: `badTracking 0.2s ease-in-out infinite ${i * 0.05}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes vhsStatic {
          0% { transform: translate(0, 0) scale(1.1); }
          25% { transform: translate(-2%, -2%) scale(1.1); }
          50% { transform: translate(2%, 2%) scale(1.1); }
          75% { transform: translate(-2%, 2%) scale(1.1); }
          100% { transform: translate(2%, -2%) scale(1.1); }
        }
        @keyframes badTracking {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(10px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

// VHS color aberration/bleeding effect
function ColorAberration() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 15,
        mixBlendMode: 'screen',
        opacity: 0.03,
        background: 'linear-gradient(90deg, #ff0000 0%, transparent 33%, transparent 66%, #0000ff 100%)',
      }}
    />
  );
}

// Scanlines
function Scanlines() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)',
        pointerEvents: 'none',
        zIndex: 12,
      }}
    />
  );
}

// Timestamp display
function Timestamp({ date, time }: { date: string; time: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
        fontSize: '14px',
        color: '#ffff00',
        textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
        zIndex: 20,
        textAlign: 'right',
        lineHeight: '1.4',
      }}
    >
      <div>{date}</div>
      <div>{time}</div>
    </div>
  );
}

// Play indicator
function PlayIndicator() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
        fontSize: '16px',
        color: '#fff',
        textShadow: '2px 2px 0 #000',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span style={{ fontSize: '12px' }}>▶</span>
      <span>PLAY</span>
    </div>
  );
}

// VCR-style navigation buttons
function VCRButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '4px',
        padding: '10px 16px',
        color: disabled ? '#444' : '#fff',
        fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
        fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.5)',
        minWidth: '60px',
      }}
    >
      {children}
    </button>
  );
}

export default function VHSPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const currentVideo = videos[currentIndex];

  const changeVideo = (direction: 'prev' | 'next') => {
    setShowStatic(true);
    setShowTracking(true);

    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
      }
      setShowStatic(false);
      setTimeout(() => setShowTracking(false), 400);
    }, 300);
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
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
      }}
    >
      {/* Load VCR font */}
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/vcr-osd-mono');
      `}</style>

      {/* Camcorder viewfinder frame */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#000',
          border: '4px solid #222',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        }}
      >
        {/* Top info bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderBottom: '1px solid #333',
          }}
        >
          <RecIndicator />
          <BatteryIndicator />
        </div>

        {/* Video screen */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '4/3',
            backgroundColor: '#111',
            overflow: 'hidden',
          }}
        >
          {/* Video content placeholder */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#444',
              backgroundColor: '#0a0a0a',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px', filter: 'grayscale(50%)' }}>📹</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{currentVideo.title}</div>
            <div style={{ fontSize: '10px', color: '#444', marginTop: '5px' }}>
              {currentVideo.src}
            </div>
          </div>

          {/* PLAY indicator */}
          <PlayIndicator />

          {/* Timestamp */}
          <Timestamp date={currentVideo.date} time={currentVideo.time} />

          {/* Video counter */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
              fontSize: '12px',
              color: '#fff',
              textShadow: '2px 2px 0 #000',
              zIndex: 20,
            }}
          >
            {String(currentIndex + 1).padStart(2, '0')} / {String(videos.length).padStart(2, '0')}
          </div>

          {/* Effects layers */}
          <Scanlines />
          <ColorAberration />
          <TrackingLines visible={showTracking} />
          <StaticNoise visible={showStatic} />

          {/* Vignette */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* Corner brackets (viewfinder style) */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
            <div
              key={corner}
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.5)',
                borderColor: corner.includes('top')
                  ? corner.includes('left')
                    ? 'white white transparent transparent'
                    : 'white transparent transparent white'
                  : corner.includes('left')
                    ? 'transparent white white transparent'
                    : 'transparent transparent white white',
                [corner.includes('top') ? 'top' : 'bottom']: '15px',
                [corner.includes('left') ? 'left' : 'right']: '15px',
                zIndex: 20,
              }}
            />
          ))}
        </div>

        {/* VCR Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            padding: '15px',
            backgroundColor: '#111',
            borderTop: '1px solid #333',
          }}
        >
          <VCRButton onClick={() => changeVideo('prev')}>
            ◀◀ REW
          </VCRButton>
          <VCRButton onClick={() => {}} disabled>
            ▶ PLAY
          </VCRButton>
          <VCRButton onClick={() => changeVideo('next')}>
            FF ▶▶
          </VCRButton>
        </div>
      </div>

      {/* Title display */}
      <div
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '4px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#0f0', fontSize: '10px', marginBottom: '4px' }}>NOW PLAYING</div>
        <div style={{ color: '#fff', fontSize: '14px' }}>{currentVideo.title}</div>
      </div>

      {/* Subscribe section */}
      <div
        style={{
          marginTop: '30px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '14px',
            fontWeight: 'normal',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '8px',
            color: '#fff',
          }}
        >
          Friends Doing Fun Things
        </h1>
        <p
          style={{
            fontSize: '11px',
            marginBottom: '16px',
            color: '#666',
          }}
        >
          Be kind, rewind, and subscribe
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              backgroundColor: '#1a1a1a',
              border: '2px solid #333',
              padding: '10px 14px',
              fontSize: '14px',
              fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
              color: '#0f0',
              width: '200px',
              borderRadius: '4px',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              backgroundColor: '#222',
              border: '2px solid #444',
              padding: '10px 16px',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'VCR OSD Mono', 'Courier New', monospace",
              fontSize: '12px',
              borderRadius: '4px',
            }}
          >
            {status === 'loading' ? '...' : 'REC ●'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: '10px', fontSize: '12px', color: status === 'error' ? '#ff0000' : '#0f0' }}>
            {message}
          </p>
        )}
      </div>

      {/* Tape counter display at bottom */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#000',
          border: '1px solid #333',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#0f0',
        }}
      >
        <div style={{ fontSize: '8px', color: '#666', marginBottom: '2px' }}>COUNTER</div>
        <div>{String(currentIndex * 127).padStart(4, '0')}</div>
      </div>
    </div>
  );
}
