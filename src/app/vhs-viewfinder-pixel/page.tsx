'use client';

import { useState, useEffect } from 'react';

// Video playlist
const videos = [
  { id: 1, src: '/videos/sample1.mp4', title: 'SUMMER CITY', date: 'JUL 15 94', time: '2:34PM' },
  { id: 2, src: '/videos/sample2.mp4', title: 'CENTRAL PARK', date: 'AUG 22 95', time: '11:15AM' },
  { id: 3, src: '/videos/sample3.mp4', title: 'ROOFTOP PARTY', date: 'SEP 08 92', time: '8:47PM' },
  { id: 4, src: '/videos/sample4.mp4', title: 'STREET FAIR', date: 'OCT 31 93', time: '4:20PM' },
  { id: 5, src: '/videos/sample5.mp4', title: 'BEACH DAY', date: 'JUN 04 96', time: '1:03PM' },
];

// Pixel REC indicator
function PixelRec() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: '#fff' }}>
      <div style={{ width: '8px', height: '8px', backgroundColor: visible ? '#f00' : '#400' }} />
      <span>REC</span>
    </div>
  );
}

// Pixel battery
function PixelBattery() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {/* Battery shape */}
      <div style={{
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          width: '24px', height: '12px',
          border: '2px solid #0f0',
          display: 'flex', gap: '2px', padding: '2px',
        }}>
          <div style={{ width: '4px', height: '100%', backgroundColor: '#0f0' }} />
          <div style={{ width: '4px', height: '100%', backgroundColor: '#0f0' }} />
          <div style={{ width: '4px', height: '100%', backgroundColor: '#0f0' }} />
        </div>
        <div style={{ width: '4px', height: '6px', backgroundColor: '#0f0' }} />
      </div>
      <span style={{ fontSize: '6px', color: '#0f0' }}>87%</span>
    </div>
  );
}

// Pixel focus brackets
function PixelFocusBrackets() {
  const size = 24;
  const bracketStyle = (pos: string): React.CSSProperties => ({
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: 'none',
    zIndex: 15,
    ...(pos === 'tl' ? { top: '10%', left: '10%' } :
       pos === 'tr' ? { top: '10%', right: '10%' } :
       pos === 'bl' ? { bottom: '10%', left: '10%' } :
       { bottom: '10%', right: '10%' }),
  });

  return (
    <>
      {/* Top-left */}
      <div style={bracketStyle('tl')}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '2px', backgroundColor: '#fff' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '12px', backgroundColor: '#fff' }} />
      </div>
      {/* Top-right */}
      <div style={bracketStyle('tr')}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '2px', backgroundColor: '#fff' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '2px', height: '12px', backgroundColor: '#fff' }} />
      </div>
      {/* Bottom-left */}
      <div style={bracketStyle('bl')}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '12px', height: '2px', backgroundColor: '#fff' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '2px', height: '12px', backgroundColor: '#fff' }} />
      </div>
      {/* Bottom-right */}
      <div style={bracketStyle('br')}>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '2px', backgroundColor: '#fff' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '2px', height: '12px', backgroundColor: '#fff' }} />
      </div>
    </>
  );
}

// Pixel autofocus center
function PixelAutofocus() {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setFocused(f => !f), 2000);
    return () => clearInterval(interval);
  }, []);

  const color = focused ? '#0f0' : '#fff';

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)', zIndex: 15,
      pointerEvents: 'none',
    }}>
      {/* Center cross */}
      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
        {/* Horizontal line */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '2px', backgroundColor: color }} />
        {/* Vertical line */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '2px', height: '8px', backgroundColor: color }} />
        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '2px', backgroundColor: color }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '8px', backgroundColor: color }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '2px', backgroundColor: color }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '2px', height: '8px', backgroundColor: color }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '8px', height: '2px', backgroundColor: color }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '2px', height: '8px', backgroundColor: color }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '2px', backgroundColor: color }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '2px', height: '8px', backgroundColor: color }} />
      </div>
      {focused && (
        <div style={{
          position: 'absolute', bottom: '-14px', left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '6px', color: '#0f0', whiteSpace: 'nowrap',
        }}>
          AF LOCK
        </div>
      )}
    </div>
  );
}

// Pixel static
function PixelStatic({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#111', zIndex: 25,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='2' height='2' fill='%23444'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23222'/%3E%3Crect x='2' y='0' width='2' height='2' fill='%23666'/%3E%3Crect x='0' y='2' width='2' height='2' fill='%23333'/%3E%3C/svg%3E")`,
      backgroundSize: '4px 4px',
      animation: 'pxStatic 0.1s steps(4) infinite',
    }}>
      <style>{`@keyframes pxStatic { 0% { background-position: 0 0; } 25% { background-position: 2px 2px; } 50% { background-position: -2px 0; } 75% { background-position: 0 -2px; } }`}</style>
    </div>
  );
}

// Pixel scanlines
function PixelScanlines() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
      pointerEvents: 'none', zIndex: 10,
    }} />
  );
}

// Pixel vignette (stepped gradient)
function PixelVignette() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.7), inset 0 0 80px rgba(0,0,0,0.4)',
      pointerEvents: 'none', zIndex: 5,
    }} />
  );
}

export default function VHSViewfinderPixel() {
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
      setTimeout(() => setShowStatic(false), 250);
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) { setStatus('success'); setMessage("YOU'RE IN!"); setEmail(''); }
      else { setStatus('error'); setMessage(data.error || 'ERROR'); }
    } catch { setStatus('error'); setMessage('ERROR'); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Press Start 2P", monospace',
      padding: '16px',
      imageRendering: 'pixelated',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>

      {/* Viewfinder container - pixel style */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '4/3',
        backgroundColor: '#0a0a0a',
        border: '8px solid #1a1a1a',
        overflow: 'hidden',
      }}>
        {/* Inner border */}
        <div style={{
          position: 'absolute',
          top: '6px', left: '6px', right: '6px', bottom: '6px',
          border: '2px solid #333',
          pointerEvents: 'none', zIndex: 15,
        }} />

        {/* Video content */}
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: '#444',
        }}>
          <div style={{ fontSize: '32px' }}>📹</div>
          <div style={{ fontSize: '8px', marginTop: '8px', color: '#666' }}>{currentVideo.title}</div>
        </div>

        {/* Top-left: REC */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 20 }}>
          <PixelRec />
        </div>

        {/* Top-center: Recording time */}
        <div style={{
          position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
          fontSize: '8px', color: '#f00', zIndex: 20,
        }}>
          {formatTime(recordTime)}
        </div>

        {/* Top-right: Battery */}
        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20 }}>
          <PixelBattery />
        </div>

        {/* Focus brackets */}
        <PixelFocusBrackets />

        {/* Center autofocus */}
        <PixelAutofocus />

        {/* Bottom-left: Date/Time */}
        <div style={{
          position: 'absolute', bottom: '8px', left: '8px',
          fontSize: '6px', color: '#ff0', zIndex: 20,
        }}>
          <div>{currentVideo.date}</div>
          <div>{currentVideo.time}</div>
        </div>

        {/* Bottom-right: Tape counter */}
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          fontSize: '6px', color: '#fff', zIndex: 20,
        }}>
          TAPE {String(currentIndex + 1).padStart(2, '0')}/{String(videos.length).padStart(2, '0')}
        </div>

        {/* Bottom-center: Mode */}
        <div style={{
          position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
          fontSize: '6px', color: '#0f0', zIndex: 20,
        }}>
          SP
        </div>

        {/* Left side indicators */}
        <div style={{
          position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 20,
        }}>
          <div style={{ fontSize: '6px', color: '#666' }}>STBY</div>
          <div style={{ fontSize: '6px', color: '#0f0' }}>▶PLAY</div>
        </div>

        {/* Right side exposure bar */}
        <div style={{
          position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', zIndex: 20,
        }}>
          <div style={{ fontSize: '6px', color: '#666' }}>+</div>
          <div style={{ width: '4px', height: '40px', backgroundColor: '#222', position: 'relative' }}>
            {/* Level indicator */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '50%', backgroundColor: '#0f0',
            }} />
            {/* Center mark */}
            <div style={{
              position: 'absolute', top: '50%', left: '-2px', right: '-2px',
              height: '2px', backgroundColor: '#fff',
            }} />
          </div>
          <div style={{ fontSize: '6px', color: '#666' }}>-</div>
          <div style={{ fontSize: '4px', color: '#fff', marginTop: '2px' }}>EXP</div>
        </div>

        {/* Effects */}
        <PixelScanlines />
        <PixelVignette />
        <PixelStatic visible={showStatic} />
      </div>

      {/* Navigation controls */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button onClick={() => changeVideo('prev')} style={{
          backgroundColor: '#111',
          border: '4px solid #222',
          padding: '8px 16px',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
        }}>
          ◀◀REW
        </button>
        <button onClick={() => changeVideo('next')} style={{
          backgroundColor: '#111',
          border: '4px solid #222',
          padding: '8px 16px',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
        }}>
          FF▶▶
        </button>
      </div>

      {/* Subscribe */}
      <div style={{
        marginTop: '20px',
        backgroundColor: '#000',
        padding: '12px 20px',
        border: '4px solid #222',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '6px', color: '#fff', margin: '0 0 10px 0', letterSpacing: '1px' }}>
          FRIENDS DOING FUN THINGS
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              backgroundColor: '#111', border: '2px solid #333', padding: '6px 10px',
              fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#0f0', width: '100px',
            }}
          />
          <button type="submit" disabled={status === 'loading'} style={{
            backgroundColor: '#111', border: '2px solid #0f0', padding: '6px 10px',
            color: '#0f0', cursor: 'pointer', fontFamily: '"Press Start 2P"', fontSize: '6px',
          }}>
            {status === 'loading' ? '...' : 'REC●'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: '8px', fontSize: '6px', color: status === 'error' ? '#f44' : '#0f0' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
