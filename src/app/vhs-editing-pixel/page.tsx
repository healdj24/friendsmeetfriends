'use client';

import { useState, useEffect } from 'react';

// Video playlist
const videos = [
  { id: 1, src: '/videos/sample1.mp4', title: 'SUMMER IN CITY', date: 'JUL 15 94', time: '2:34PM' },
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
      <div style={{ width: '8px', height: '8px', backgroundColor: visible ? '#ff0000' : '#440000' }} />
      <span>REC</span>
    </div>
  );
}

// Pixel scanlines
function PixelScanlines() {
  return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)', pointerEvents: 'none', zIndex: 10 }} />;
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

export default function VHSEditingPixel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const currentVideo = videos[currentIndex];

  const changeVideo = (dir: 'prev' | 'next') => {
    setShowStatic(true);
    setTimeout(() => {
      setCurrentIndex(prev => dir === 'next' ? (prev + 1) % videos.length : (prev - 1 + videos.length) % videos.length);
      setTimeout(() => setShowStatic(false), 300);
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
      backgroundColor: '#1a1a2e',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Press Start 2P", monospace',
      imageRendering: 'pixelated',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>

      {/* Cork board wall - pixel style */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        backgroundColor: '#8B5A2B',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='4' height='4' fill='%239B6A3B'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%237B4A1B'/%3E%3C/svg%3E")`,
        backgroundSize: '8px 8px',
      }} />

      {/* Desk surface */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
        backgroundColor: '#2F4F4F',
      }} />

      {/* Pixel photos on cork board */}
      <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50)', display: 'flex', gap: '16px' }}>
        {[
          { color: '#87CEEB', rot: -5 },
          { color: '#90EE90', rot: 3 },
          { color: '#FFB6C1', rot: -2 },
          { color: '#DDA0DD', rot: 4 },
          { color: '#F0E68C', rot: -3 },
        ].map((photo, i) => (
          <div key={i} style={{
            width: '48px', height: '40px', backgroundColor: '#fff', padding: '4px',
            transform: `rotate(${photo.rot}deg)`, border: '2px solid #ccc',
          }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: photo.color }} />
            <div style={{
              position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)',
              width: '8px', height: '8px', backgroundColor: '#ff4444', borderRadius: '50%',
            }} />
          </div>
        ))}
      </div>

      {/* Post-it */}
      <div style={{
        position: 'absolute', top: '80px', right: '15%',
        width: '48px', height: '48px', backgroundColor: '#FFFF88',
        transform: 'rotate(5deg)', padding: '4px',
      }}>
        <div style={{ fontSize: '4px', color: '#333' }}>DEADLINE</div>
        <div style={{ fontSize: '4px', color: '#333', marginTop: '4px' }}>FRI 5PM</div>
      </div>

      {/* EDITING BAY - Pixel style */}
      <div style={{
        position: 'absolute',
        top: '42%',
        left: '50%',
        transform: 'translate(-50%, -15%)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
      }}>
        {/* Small monitor left */}
        <div style={{ backgroundColor: '#222', padding: '6px', border: '4px solid #111' }}>
          <div style={{ width: '64px', height: '48px', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '6px', color: '#0f0' }}>PREVIEW</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2px', fontSize: '4px', color: '#666' }}>MON1</div>
        </div>

        {/* MAIN MONITOR */}
        <div style={{ backgroundColor: '#1a1a1a', padding: '8px', border: '4px solid #0a0a0a' }}>
          {/* Brand */}
          <div style={{ textAlign: 'center', fontSize: '4px', color: '#444', marginBottom: '4px', letterSpacing: '1px' }}>TRINITRON</div>

          {/* Screen */}
          <div style={{ position: 'relative', width: '200px', aspectRatio: '4/3', backgroundColor: '#000', border: '2px solid #111', overflow: 'hidden' }}>
            {/* Content */}
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
              <div style={{ fontSize: '20px' }}>📹</div>
              <div style={{ fontSize: '6px', marginTop: '4px' }}>{currentVideo.title}</div>
            </div>

            {/* REC */}
            <div style={{ position: 'absolute', top: '4px', left: '4px' }}><PixelRec /></div>

            {/* PLAY */}
            <div style={{ position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)', fontSize: '6px', color: '#fff' }}>▶PLAY</div>

            {/* Timestamp */}
            <div style={{ position: 'absolute', bottom: '4px', right: '4px', fontSize: '6px', color: '#ff0', textAlign: 'right' }}>
              <div>{currentVideo.date}</div>
              <div>{currentVideo.time}</div>
            </div>

            {/* Counter */}
            <div style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '6px', color: '#fff' }}>
              {String(currentIndex + 1).padStart(2, '0')}/{String(videos.length).padStart(2, '0')}
            </div>

            <PixelScanlines />
            <PixelStatic visible={showStatic} />
          </div>

          {/* Knobs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
            {['BRT', 'CON', 'COL'].map(l => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#333', border: '2px solid #222', borderRadius: '50%', margin: '0 auto' }} />
                <div style={{ fontSize: '4px', color: '#666', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Waveform monitor right */}
        <div style={{ backgroundColor: '#222', padding: '6px', border: '4px solid #111' }}>
          <div style={{ width: '64px', height: '48px', backgroundColor: '#001a00', position: 'relative' }}>
            {/* Grid lines */}
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${25 * i}%`, height: '1px', backgroundColor: '#0f0', opacity: 0.2 }} />
            ))}
            {/* Waveform */}
            <div style={{ position: 'absolute', top: '30%', left: '10%', width: '20%', height: '40%', backgroundColor: '#0f0', opacity: 0.6 }} />
            <div style={{ position: 'absolute', top: '40%', left: '35%', width: '15%', height: '20%', backgroundColor: '#0f0', opacity: 0.6 }} />
            <div style={{ position: 'absolute', top: '25%', left: '55%', width: '20%', height: '50%', backgroundColor: '#0f0', opacity: 0.6 }} />
            <div style={{ position: 'absolute', top: '35%', left: '80%', width: '10%', height: '30%', backgroundColor: '#0f0', opacity: 0.6 }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '2px', fontSize: '4px', color: '#666' }}>WAVE</div>
        </div>
      </div>

      {/* VCR DECK - Pixel */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#111',
        padding: '8px 16px',
        border: '4px solid #222',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Tape slot */}
        <div style={{ width: '64px', height: '12px', backgroundColor: '#000', border: '2px solid #222' }} />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => changeVideo('prev')} style={{
            backgroundColor: '#222', border: '2px solid #333', padding: '6px 8px',
            color: '#fff', cursor: 'pointer', fontSize: '6px', fontFamily: '"Press Start 2P"',
          }}>◀◀REW</button>
          <button style={{
            backgroundColor: '#222', border: '2px solid #0f0', padding: '6px 8px',
            color: '#0f0', cursor: 'pointer', fontSize: '6px', fontFamily: '"Press Start 2P"',
          }}>▶PLAY</button>
          <button onClick={() => changeVideo('next')} style={{
            backgroundColor: '#222', border: '2px solid #333', padding: '6px 8px',
            color: '#fff', cursor: 'pointer', fontSize: '6px', fontFamily: '"Press Start 2P"',
          }}>FF▶▶</button>
        </div>

        {/* Counter display */}
        <div style={{ backgroundColor: '#000', padding: '4px 6px', border: '2px solid #222' }}>
          <span style={{ fontSize: '8px', color: '#0f0' }}>{String(currentIndex * 127).padStart(4, '0')}</span>
        </div>
      </div>

      {/* Subscribe - pixel */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#000',
        padding: '12px 20px',
        border: '4px solid #333',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '6px', color: '#fff', margin: '0 0 8px 0', letterSpacing: '1px' }}>
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
              backgroundColor: '#111', border: '2px solid #333', padding: '4px 8px',
              fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#0f0', width: '100px',
            }}
          />
          <button type="submit" disabled={status === 'loading'} style={{
            backgroundColor: '#222', border: '2px solid #0f0', padding: '4px 8px',
            color: '#0f0', cursor: 'pointer', fontSize: '6px', fontFamily: '"Press Start 2P"',
          }}>
            {status === 'loading' ? '...' : 'REC●'}
          </button>
        </form>
        {message && <p style={{ marginTop: '6px', fontSize: '6px', color: status === 'error' ? '#f44' : '#0f0' }}>{message}</p>}
      </div>
    </div>
  );
}
