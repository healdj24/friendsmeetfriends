'use client';

import { useState, useEffect } from 'react';

// Video playlist
const videos = [
  { id: 1, src: '/videos/sample1.mp4', title: 'Summer in the City', date: 'JUL 15 1994', time: '2:34 PM' },
  { id: 2, src: '/videos/sample2.mp4', title: 'Central Park Picnic', date: 'AUG 22 1995', time: '11:15 AM' },
  { id: 3, src: '/videos/sample3.mp4', title: 'Rooftop Party', date: 'SEP 08 1992', time: '8:47 PM' },
  { id: 4, src: '/videos/sample4.mp4', title: 'Street Fair', date: 'OCT 31 1993', time: '4:20 PM' },
  { id: 5, src: '/videos/sample5.mp4', title: 'Beach Day', date: 'JUN 04 1996', time: '1:03 PM' },
];

// Blinking REC indicator
function RecIndicator() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Comic Sans MS', cursive", fontSize: '14px', color: '#fff' }}>
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%',
        backgroundColor: visible ? '#ff3333' : '#661111',
        boxShadow: visible ? '0 0 8px #ff3333' : 'none',
      }} />
      <span style={{ textShadow: '1px 1px 2px #000' }}>REC</span>
    </div>
  );
}

// Battery indicator
function BatteryIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <svg width="28" height="14" viewBox="0 0 28 14">
        {/* Battery body - hand drawn style */}
        <path d="M2 1 Q1 1 1 2 L1 12 Q1 13 2 13 L22 13 Q23 13 23 12 L23 2 Q23 1 22 1 Z" fill="none" stroke="#0f0" strokeWidth="1.5" />
        {/* Battery tip */}
        <path d="M23 4 L26 4 Q27 4 27 5 L27 9 Q27 10 26 10 L23 10" fill="none" stroke="#0f0" strokeWidth="1.5" />
        {/* Battery level bars */}
        <rect x="3" y="3" width="4" height="8" fill="#0f0" rx="1" />
        <rect x="9" y="3" width="4" height="8" fill="#0f0" rx="1" />
        <rect x="15" y="3" width="4" height="8" fill="#0f0" rx="1" />
      </svg>
      <span style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '10px', color: '#0f0' }}>87%</span>
    </div>
  );
}

// Focus brackets (corners)
function FocusBrackets() {
  const bracketStyle = (position: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: '40px',
      height: '40px',
      pointerEvents: 'none',
    };

    const positions: Record<string, React.CSSProperties> = {
      'top-left': { top: '8%', left: '8%' },
      'top-right': { top: '8%', right: '8%' },
      'bottom-left': { bottom: '8%', left: '8%' },
      'bottom-right': { bottom: '8%', right: '8%' },
    };

    return { ...base, ...positions[position] };
  };

  return (
    <>
      {/* Top-left bracket */}
      <svg style={bracketStyle('top-left')} viewBox="0 0 40 40">
        <path d="M2 38 L2 8 Q2 2 8 2 L38 2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {/* Top-right bracket */}
      <svg style={bracketStyle('top-right')} viewBox="0 0 40 40">
        <path d="M38 38 L38 8 Q38 2 32 2 L2 2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {/* Bottom-left bracket */}
      <svg style={bracketStyle('bottom-left')} viewBox="0 0 40 40">
        <path d="M2 2 L2 32 Q2 38 8 38 L38 38" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {/* Bottom-right bracket */}
      <svg style={bracketStyle('bottom-right')} viewBox="0 0 40 40">
        <path d="M38 2 L38 32 Q38 38 32 38 L2 38" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </>
  );
}

// Center autofocus marker
function AutofocusMarker() {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setFocused(f => !f), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* Center cross */}
        <line x1="35" y1="40" x2="45" y2="40" stroke={focused ? '#0f0' : '#fff'} strokeWidth="1.5" />
        <line x1="40" y1="35" x2="40" y2="45" stroke={focused ? '#0f0' : '#fff'} strokeWidth="1.5" />
        {/* Focus brackets */}
        <path d="M10 25 L10 10 L25 10" fill="none" stroke={focused ? '#0f0' : '#fff'} strokeWidth="1.5" />
        <path d="M55 10 L70 10 L70 25" fill="none" stroke={focused ? '#0f0' : '#fff'} strokeWidth="1.5" />
        <path d="M70 55 L70 70 L55 70" fill="none" stroke={focused ? '#0f0' : '#fff'} strokeWidth="1.5" />
        <path d="M25 70 L10 70 L10 55" fill="none" stroke={focused ? '#0f0' : '#fff'} strokeWidth="1.5" />
      </svg>
      {focused && (
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: '10px',
          color: '#0f0',
          whiteSpace: 'nowrap',
        }}>
          AF LOCK
        </div>
      )}
    </div>
  );
}

// VHS static effect
function VHSStatic({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#111', zIndex: 25, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        animation: 'vhsStatic 0.08s steps(8) infinite',
      }} />
      <style>{`@keyframes vhsStatic { 0% { transform: translate(0,0); } 50% { transform: translate(-2%,-2%); } 100% { transform: translate(2%,2%); } }`}</style>
    </div>
  );
}

// Scanlines
function Scanlines() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px)',
      pointerEvents: 'none', zIndex: 10,
    }} />
  );
}

// Vignette effect
function Vignette() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
      pointerEvents: 'none', zIndex: 5,
    }} />
  );
}

export default function VHSViewfinderIllustrated() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const currentVideo = videos[currentIndex];

  // Recording timer
  useEffect(() => {
    const interval = setInterval(() => setRecordTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const changeVideo = (dir: 'prev' | 'next') => {
    setShowStatic(true);
    setTimeout(() => {
      setCurrentIndex(prev => dir === 'next' ? (prev + 1) % videos.length : (prev - 1 + videos.length) % videos.length);
      setShowStatic(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) { setStatus('success'); setMessage("You're in!"); setEmail(''); }
      else { setStatus('error'); setMessage(data.error || 'Something went wrong'); }
    } catch { setStatus('error'); setMessage('Something went wrong'); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Comic Sans MS', cursive",
      padding: '20px',
    }}>
      {/* Viewfinder container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '4/3',
        backgroundColor: '#0a0a0a',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '8px solid #222',
        boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Inner viewfinder frame */}
        <div style={{
          position: 'absolute',
          top: '4%', left: '4%', right: '4%', bottom: '4%',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '10px',
          pointerEvents: 'none',
          zIndex: 15,
        }} />

        {/* Video content area */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
        }}>
          <div style={{ fontSize: '48px' }}>📹</div>
          <div style={{ fontSize: '16px', marginTop: '12px', color: '#888' }}>{currentVideo.title}</div>
        </div>

        {/* Top-left: REC indicator */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 20 }}>
          <RecIndicator />
        </div>

        {/* Top-center: Recording time */}
        <div style={{
          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'monospace', fontSize: '16px', color: '#ff3333',
          textShadow: '1px 1px 2px #000', zIndex: 20,
        }}>
          {formatTime(recordTime)}
        </div>

        {/* Top-right: Battery */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20 }}>
          <BatteryIndicator />
        </div>

        {/* Focus brackets */}
        <FocusBrackets />

        {/* Center autofocus */}
        <AutofocusMarker />

        {/* Bottom-left: Date/Time stamp */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          fontFamily: "'Comic Sans MS', cursive", fontSize: '14px', color: '#ffcc00',
          textShadow: '1px 1px 2px #000', zIndex: 20,
        }}>
          <div>{currentVideo.date}</div>
          <div>{currentVideo.time}</div>
        </div>

        {/* Bottom-right: Video counter */}
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px',
          fontFamily: 'monospace', fontSize: '14px', color: '#fff',
          textShadow: '1px 1px 2px #000', zIndex: 20,
        }}>
          TAPE {String(currentIndex + 1).padStart(2, '0')}/{String(videos.length).padStart(2, '0')}
        </div>

        {/* Bottom-center: Mode indicator */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Comic Sans MS', cursive", fontSize: '12px', color: '#0f0',
          textShadow: '1px 1px 2px #000', zIndex: 20,
        }}>
          SP MODE
        </div>

        {/* Effects */}
        <Scanlines />
        <Vignette />
        <VHSStatic visible={showStatic} />

        {/* Left side indicators */}
        <div style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 20,
        }}>
          <div style={{ fontSize: '10px', color: '#fff', opacity: 0.7 }}>STBY</div>
          <div style={{ fontSize: '10px', color: '#0f0' }}>▶ PLAY</div>
        </div>

        {/* Right side exposure bar */}
        <div style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 20,
        }}>
          <div style={{ fontSize: '8px', color: '#fff', opacity: 0.7 }}>+</div>
          <div style={{ width: '6px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px', position: 'relative' }}>
            <div style={{
              position: 'absolute', bottom: '50%', left: 0, right: 0, height: '50%',
              backgroundColor: '#0f0', borderRadius: '0 0 3px 3px',
            }} />
          </div>
          <div style={{ fontSize: '8px', color: '#fff', opacity: 0.7 }}>-</div>
          <div style={{ fontSize: '8px', color: '#fff', marginTop: '4px' }}>EXP</div>
        </div>
      </div>

      {/* Navigation controls */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '20px',
      }}>
        <button onClick={() => changeVideo('prev')} style={{
          backgroundColor: '#222',
          border: '3px solid #444',
          borderRadius: '8px',
          padding: '12px 24px',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: '14px',
          boxShadow: '3px 3px 0 #111',
        }}>
          ◀◀ REW
        </button>
        <button onClick={() => changeVideo('next')} style={{
          backgroundColor: '#222',
          border: '3px solid #444',
          borderRadius: '8px',
          padding: '12px 24px',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: '14px',
          boxShadow: '3px 3px 0 #111',
        }}>
          FF ▶▶
        </button>
      </div>

      {/* Subscribe section */}
      <div style={{
        marginTop: '30px',
        backgroundColor: 'rgba(20,20,20,0.9)',
        padding: '20px 30px',
        borderRadius: '12px',
        border: '3px solid #333',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '14px',
          color: '#fff',
          margin: '0 0 15px 0',
          fontFamily: "'Comic Sans MS', cursive",
          letterSpacing: '2px',
        }}>
          FRIENDS DOING FUN THINGS
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              backgroundColor: '#1a1a1a',
              border: '2px solid #444',
              padding: '10px 14px',
              fontSize: '12px',
              fontFamily: "'Comic Sans MS', cursive",
              color: '#0f0',
              width: '180px',
              borderRadius: '6px',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              backgroundColor: '#333',
              border: '2px solid #0f0',
              padding: '10px 20px',
              color: '#0f0',
              cursor: 'pointer',
              fontFamily: "'Comic Sans MS', cursive",
              fontSize: '12px',
              borderRadius: '6px',
            }}
          >
            {status === 'loading' ? '...' : 'REC ●'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: '10px', fontSize: '12px', color: status === 'error' ? '#ff4444' : '#0f0' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
