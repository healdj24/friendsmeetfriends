'use client';

import { useState } from 'react';

// Video playlist
const videos = [
  { id: 1, src: '/videos/sample1.mp4', title: 'Summer in the City', date: 'JUL 1994', channel: 3 },
  { id: 2, src: '/videos/sample2.mp4', title: 'Central Park Picnic', date: 'AUG 1995', channel: 5 },
  { id: 3, src: '/videos/sample3.mp4', title: 'Rooftop Party', date: 'SEP 1992', channel: 7 },
  { id: 4, src: '/videos/sample4.mp4', title: 'Street Fair', date: 'OCT 1993', channel: 9 },
  { id: 5, src: '/videos/sample5.mp4', title: 'Stoop Hangs', date: 'JUN 1996', channel: 11 },
];

// Pixel block component
function PixelBlock({ color, width, height, x, y }: { color: string; width: number; height: number; x: number; y: number }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: color,
      imageRendering: 'pixelated',
    }} />
  );
}

// Pixel window component
function PixelWindow({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: '16px',
      height: '20px',
      backgroundColor: lit ? '#FFE4B5' : '#2C3E50',
      border: '2px solid #1a1a1a',
      boxShadow: lit ? 'inset 0 0 4px #FFF' : 'none',
    }} />
  );
}

// Scanlines for pixel aesthetic
function PixelScanlines() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
      pointerEvents: 'none', zIndex: 10,
    }} />
  );
}

// Static noise - pixelated
function PixelStatic({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#111', zIndex: 20,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='4' height='4' fill='%23333'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23333'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%23666'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%23999'/%3E%3C/svg%3E")`,
      backgroundSize: '8px 8px',
      animation: 'pixelNoise 0.1s steps(4) infinite',
    }}>
      <style>{`@keyframes pixelNoise { 0% { background-position: 0 0; } 25% { background-position: 4px 4px; } 50% { background-position: -4px 0; } 75% { background-position: 0 -4px; } 100% { background-position: 4px -4px; } }`}</style>
    </div>
  );
}

export default function TVPixel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const currentVideo = videos[currentIndex];

  const changeChannel = (dir: 'up' | 'down') => {
    setShowStatic(true);
    setTimeout(() => {
      setCurrentIndex(prev => dir === 'up' ? (prev + 1) % videos.length : (prev - 1 + videos.length) % videos.length);
      setTimeout(() => setShowStatic(false), 300);
    }, 200);
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
      backgroundColor: '#5B8CDE',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Press Start 2P", monospace',
      imageRendering: 'pixelated',
    }}>
      {/* Load pixel font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>

      {/* Sky - solid pixel color */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
        background: 'linear-gradient(180deg, #4A7CC9 0%, #5B8CDE 60%, #87CEEB 100%)',
      }} />

      {/* Pixel Sun */}
      <div style={{
        position: 'absolute', top: '40px', right: '80px',
        width: '48px', height: '48px',
        backgroundColor: '#FFD700',
        boxShadow: '8px 0 0 #FFD700, -8px 0 0 #FFD700, 0 8px 0 #FFD700, 0 -8px 0 #FFD700',
      }} />

      {/* Pixel Art NYC Scene */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {/* Building 1 - Left brownstone */}
        <div style={{ position: 'absolute', left: '20px', bottom: '120px', width: '100px', height: '250px', backgroundColor: '#8B6914' }}>
          {/* Roof detail */}
          <div style={{ position: 'absolute', top: '-16px', left: '-8px', width: '116px', height: '16px', backgroundColor: '#6B4914' }} />
          {/* Windows */}
          <PixelWindow x={12} y={30} lit={false} />
          <PixelWindow x={44} y={30} lit={true} />
          <PixelWindow x={76} y={30} lit={false} />
          <PixelWindow x={12} y={70} lit={true} />
          <PixelWindow x={44} y={70} lit={false} />
          <PixelWindow x={76} y={70} lit={true} />
          <PixelWindow x={12} y={110} lit={false} />
          <PixelWindow x={44} y={110} lit={true} />
          <PixelWindow x={76} y={110} lit={false} />
          {/* Door */}
          <div style={{ position: 'absolute', bottom: '0', left: '36px', width: '28px', height: '50px', backgroundColor: '#3d2817', border: '2px solid #2a1a0f' }}>
            <div style={{ position: 'absolute', right: '6px', top: '22px', width: '6px', height: '6px', backgroundColor: '#FFD700', borderRadius: '50%' }} />
          </div>
        </div>

        {/* Building 2 - Center tall */}
        <div style={{ position: 'absolute', left: '140px', bottom: '120px', width: '140px', height: '320px', backgroundColor: '#CD853F' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-4px', width: '148px', height: '20px', backgroundColor: '#A0522D' }} />
          {/* Windows grid */}
          {[0, 1, 2, 3, 4].map(row => (
            [0, 1, 2].map(col => (
              <PixelWindow key={`${row}-${col}`} x={16 + col * 44} y={30 + row * 55} lit={Math.random() > 0.5} />
            ))
          ))}
          {/* Fire escape */}
          <div style={{ position: 'absolute', left: '8px', top: '25px', width: '40px', height: '220px', border: '4px solid #333', backgroundColor: 'transparent' }}>
            <div style={{ position: 'absolute', top: '50px', left: '-4px', right: '-4px', height: '4px', backgroundColor: '#333' }} />
            <div style={{ position: 'absolute', top: '100px', left: '-4px', right: '-4px', height: '4px', backgroundColor: '#333' }} />
            <div style={{ position: 'absolute', top: '150px', left: '-4px', right: '-4px', height: '4px', backgroundColor: '#333' }} />
          </div>
          {/* Stoop */}
          <div style={{ position: 'absolute', bottom: '-8px', left: '45px', width: '50px', height: '8px', backgroundColor: '#8B4513' }} />
          <div style={{ position: 'absolute', bottom: '-24px', left: '40px', width: '60px', height: '16px', backgroundColor: '#A0522D' }} />
        </div>

        {/* Building 3 - Right */}
        <div style={{ position: 'absolute', left: '300px', bottom: '120px', width: '120px', height: '280px', backgroundColor: '#DEB887' }}>
          <div style={{ position: 'absolute', top: '-16px', left: '-4px', width: '128px', height: '16px', backgroundColor: '#C4A97A' }} />
          {[0, 1, 2, 3].map(row => (
            [0, 1, 2].map(col => (
              <PixelWindow key={`${row}-${col}`} x={12 + col * 36} y={25 + row * 60} lit={Math.random() > 0.4} />
            ))
          ))}
          {/* Awning */}
          <div style={{ position: 'absolute', bottom: '80px', left: '-8px', width: '136px', height: '24px', backgroundColor: '#E74C3C' }} />
          <div style={{ position: 'absolute', bottom: '76px', left: '-8px', width: '136px', height: '4px', backgroundColor: '#C0392B' }} />
        </div>

        {/* Building 4 - Far right */}
        <div style={{ position: 'absolute', right: '0', bottom: '120px', width: '100px', height: '350px', backgroundColor: '#B8860B' }}>
          {[0, 1, 2, 3, 4, 5].map(row => (
            [0, 1].map(col => (
              <PixelWindow key={`${row}-${col}`} x={16 + col * 44} y={20 + row * 50} lit={Math.random() > 0.5} />
            ))
          ))}
        </div>

        {/* Water tower */}
        <div style={{ position: 'absolute', left: '45px', bottom: '370px' }}>
          <div style={{ width: '50px', height: '32px', backgroundColor: '#8B4513', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '8px', width: '8px', height: '20px', backgroundColor: '#5C4033' }} />
          <div style={{ position: 'absolute', bottom: '-20px', right: '8px', width: '8px', height: '20px', backgroundColor: '#5C4033' }} />
        </div>

        {/* Sidewalk */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '80px', height: '40px', backgroundColor: '#999' }}>
          {/* Sidewalk lines */}
          {[0, 80, 160, 240, 320, 400].map(x => (
            <div key={x} style={{ position: 'absolute', left: `${x}px`, top: 0, width: '4px', height: '100%', backgroundColor: '#777' }} />
          ))}
        </div>

        {/* Street */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '0', height: '80px', backgroundColor: '#333' }}>
          {/* Yellow dashed line */}
          <div style={{ position: 'absolute', top: '36px', left: 0, right: 0, height: '8px', display: 'flex', gap: '24px' }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{ width: '32px', height: '8px', backgroundColor: '#FFD700' }} />
            ))}
          </div>
        </div>

        {/* Street lamp */}
        <div style={{ position: 'absolute', left: '420px', bottom: '80px' }}>
          <div style={{ width: '8px', height: '120px', backgroundColor: '#333', marginLeft: '12px' }} />
          <div style={{ width: '32px', height: '16px', backgroundColor: '#333', borderRadius: '4px 4px 0 0' }} />
          <div style={{ width: '24px', height: '8px', backgroundColor: '#FFFACD', marginLeft: '4px', boxShadow: '0 0 16px #FFFACD' }} />
        </div>

        {/* Trash can */}
        <div style={{ position: 'absolute', right: '40px', bottom: '80px' }}>
          <div style={{ width: '24px', height: '32px', backgroundColor: '#666', border: '2px solid #444' }} />
          <div style={{ width: '28px', height: '8px', backgroundColor: '#555', marginLeft: '-2px', marginTop: '-2px' }} />
        </div>
      </div>

      {/* THE PIXEL TV */}
      <div style={{
        position: 'absolute',
        bottom: '140px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
      }}>
        {/* Crate stand */}
        <div style={{
          position: 'absolute',
          bottom: '-24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '24px',
          backgroundColor: '#8B4513',
          border: '4px solid #5C4033',
        }} />

        {/* TV Body - Pixel style */}
        <div style={{
          backgroundColor: '#C4A97A',
          padding: '12px',
          border: '4px solid #8B7355',
          width: '240px',
        }}>
          {/* Brand */}
          <div style={{
            textAlign: 'center',
            fontSize: '6px',
            color: '#5C4033',
            marginBottom: '4px',
            letterSpacing: '2px',
          }}>
            FRIENDVISION
          </div>

          {/* Screen bezel */}
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '8px',
            border: '4px solid #000',
          }}>
            {/* Screen */}
            <div style={{
              position: 'relative',
              backgroundColor: '#0a0a0a',
              aspectRatio: '4/3',
              overflow: 'hidden',
            }}>
              {/* Video placeholder */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#444',
                fontSize: '8px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📺</div>
                <div>{currentVideo.title}</div>
              </div>

              {/* Channel */}
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                fontSize: '8px',
                color: '#0f0',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '2px 4px',
              }}>
                CH{currentVideo.channel}
              </div>

              {/* Date */}
              <div style={{
                position: 'absolute',
                bottom: '4px',
                left: '4px',
                fontSize: '6px',
                color: '#fff',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '2px 4px',
              }}>
                {currentVideo.date}
              </div>

              <PixelScanlines />
              <PixelStatic visible={showStatic} />
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
          }}>
            {/* Speaker */}
            <div style={{
              width: '40px',
              height: '24px',
              backgroundColor: '#8B7355',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2px',
              padding: '2px',
            }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ backgroundColor: '#5C4033' }} />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => changeChannel('down')}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#333',
                  border: '2px solid #222',
                  color: '#888',
                  fontSize: '8px',
                  cursor: 'pointer',
                }}
              >◀</button>
              <button
                onClick={() => changeChannel('up')}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#333',
                  border: '2px solid #222',
                  color: '#888',
                  fontSize: '8px',
                  cursor: 'pointer',
                }}
              >▶</button>
            </div>

            {/* LED */}
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#0f0',
              boxShadow: '0 0 4px #0f0',
            }} />
          </div>
        </div>
      </div>

      {/* Subscribe - pixel style */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        backgroundColor: '#fff',
        padding: '12px 20px',
        border: '4px solid #333',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '8px',
          color: '#333',
          margin: '0 0 8px 0',
        }}>
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
              border: '2px solid #333',
              padding: '6px 8px',
              fontSize: '8px',
              width: '120px',
              fontFamily: '"Press Start 2P", monospace',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              backgroundColor: '#4CAF50',
              border: '2px solid #333',
              padding: '6px 12px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '8px',
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            {status === 'loading' ? '...' : 'JOIN'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: '8px', fontSize: '6px', color: status === 'error' ? '#c00' : '#060' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
