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

// REC indicator
function RecIndicator() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '12px', color: '#fff' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: visible ? '#ff0000' : '#660000', boxShadow: visible ? '0 0 6px #ff0000' : 'none' }} />
      <span>REC</span>
    </div>
  );
}

// VHS effects
function VHSScanlines() {
  return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)', pointerEvents: 'none', zIndex: 10 }} />;
}

function VHSStatic({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#111', zIndex: 25, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        animation: 'vhsStatic 0.08s steps(8) infinite',
      }} />
      <style>{`@keyframes vhsStatic { 0% { transform: translate(0,0); } 50% { transform: translate(-2%,-2%); } 100% { transform: translate(2%,2%); } }`}</style>
    </div>
  );
}

function TrackingLines({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, pointerEvents: 'none' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, height: '3px',
          backgroundColor: 'rgba(255,255,255,0.3)',
          top: `${15 + i * 14}%`,
          animation: `tracking 0.15s ease-in-out ${i * 0.02}s`,
        }} />
      ))}
      <style>{`@keyframes tracking { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

export default function VHSEditingIllustrated() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const currentVideo = videos[currentIndex];

  const changeVideo = (dir: 'prev' | 'next') => {
    setShowStatic(true);
    setShowTracking(true);
    setTimeout(() => {
      setCurrentIndex(prev => dir === 'next' ? (prev + 1) % videos.length : (prev - 1 + videos.length) % videos.length);
      setShowStatic(false);
      setTimeout(() => setShowTracking(false), 400);
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
      backgroundColor: '#1a1a2e',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Comic Sans MS', cursive",
    }}>
      {/* Room background - cork board wall */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        backgroundColor: '#D2691E',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
      }} />

      {/* Desk surface */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        backgroundColor: '#2F4F4F',
        background: 'linear-gradient(180deg, #3a5a5a 0%, #2F4F4F 10%, #1a3a3a 100%)',
      }} />

      {/* Cork board with photos */}
      <svg viewBox="0 0 800 200" style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: '600px', height: 'auto' }}>
        {/* Cork board frame */}
        <rect x="10" y="10" width="780" height="180" fill="#8B4513" rx="5" />
        <rect x="20" y="20" width="760" height="160" fill="#D2691E" rx="3" />

        {/* Pinned photos */}
        <g transform="translate(40, 35)">
          <rect width="80" height="60" fill="#fff" transform="rotate(-5)" />
          <rect x="5" y="5" width="70" height="45" fill="#87CEEB" transform="rotate(-5)" />
          <circle cx="40" cy="5" r="4" fill="#ff4444" />
        </g>

        <g transform="translate(150, 45)">
          <rect width="70" height="55" fill="#fff" transform="rotate(3)" />
          <rect x="5" y="5" width="60" height="40" fill="#90EE90" transform="rotate(3)" />
          <circle cx="35" cy="5" r="4" fill="#ffff00" />
        </g>

        <g transform="translate(250, 30)">
          <rect width="90" height="65" fill="#fff" transform="rotate(-2)" />
          <rect x="5" y="5" width="80" height="50" fill="#FFB6C1" transform="rotate(-2)" />
          <circle cx="45" cy="5" r="4" fill="#44ff44" />
        </g>

        <g transform="translate(380, 40)">
          <rect width="75" height="55" fill="#fff" transform="rotate(4)" />
          <rect x="5" y="5" width="65" height="40" fill="#DDA0DD" transform="rotate(4)" />
          <circle cx="37" cy="5" r="4" fill="#ff4444" />
        </g>

        <g transform="translate(490, 35)">
          <rect width="85" height="60" fill="#fff" transform="rotate(-3)" />
          <rect x="5" y="5" width="75" height="45" fill="#F0E68C" transform="rotate(-3)" />
          <circle cx="42" cy="5" r="4" fill="#4444ff" />
        </g>

        <g transform="translate(610, 45)">
          <rect width="70" height="50" fill="#fff" transform="rotate(2)" />
          <rect x="5" y="5" width="60" height="35" fill="#98FB98" transform="rotate(2)" />
          <circle cx="35" cy="5" r="4" fill="#ffff00" />
        </g>

        {/* Post-it note */}
        <g transform="translate(560, 100)">
          <rect width="60" height="60" fill="#FFFF88" transform="rotate(5)" />
          <text x="10" y="25" fontSize="8" fill="#333" transform="rotate(5)">DEADLINE</text>
          <text x="10" y="40" fontSize="8" fill="#333" transform="rotate(5)">FRI 5PM</text>
        </g>
      </svg>

      {/* EDITING BAY SETUP */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -20%)',
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-end',
      }}>
        {/* Small monitor - left */}
        <div style={{
          backgroundColor: '#333',
          padding: '8px',
          borderRadius: '8px',
          border: '3px solid #222',
          boxShadow: '4px 4px 0 #111',
        }}>
          <div style={{
            width: '100px',
            height: '75px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '10px',
          }}>
            PREVIEW
          </div>
          <div style={{ textAlign: 'center', marginTop: '4px', color: '#666', fontSize: '8px' }}>MON 1</div>
        </div>

        {/* MAIN MONITOR */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '12px',
          borderRadius: '12px',
          border: '4px solid #1a1a1a',
          boxShadow: '6px 6px 0 #0a0a0a',
        }}>
          {/* Monitor brand */}
          <div style={{ textAlign: 'center', color: '#666', fontSize: '10px', marginBottom: '6px', letterSpacing: '2px' }}>
            SONY TRINITRON
          </div>

          {/* Screen */}
          <div style={{
            position: 'relative',
            width: '280px',
            aspectRatio: '4/3',
            backgroundColor: '#000',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '3px solid #111',
          }}>
            {/* Video content */}
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#444',
            }}>
              <div style={{ fontSize: '36px' }}>📹</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>{currentVideo.title}</div>
            </div>

            {/* REC indicator */}
            <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
              <RecIndicator />
            </div>

            {/* Timestamp */}
            <div style={{
              position: 'absolute', bottom: '8px', right: '8px',
              fontFamily: 'monospace', fontSize: '11px', color: '#ffff00',
              textShadow: '1px 1px 0 #000',
            }}>
              <div>{currentVideo.date}</div>
              <div>{currentVideo.time}</div>
            </div>

            {/* Counter */}
            <div style={{
              position: 'absolute', bottom: '8px', left: '8px',
              fontFamily: 'monospace', fontSize: '10px', color: '#fff',
            }}>
              {String(currentIndex + 1).padStart(2, '0')}/{String(videos.length).padStart(2, '0')}
            </div>

            <VHSScanlines />
            <VHSStatic visible={showStatic} />
            <TrackingLines visible={showTracking} />

            {/* PLAY indicator */}
            <div style={{
              position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
              fontFamily: 'monospace', fontSize: '12px', color: '#fff',
            }}>
              ▶ PLAY
            </div>
          </div>

          {/* Monitor controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            {['BRIGHT', 'CONT', 'COLOR'].map(label => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'linear-gradient(145deg, #555, #333)',
                  border: '2px solid #222', margin: '0 auto',
                }} />
                <div style={{ fontSize: '6px', color: '#666', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Waveform monitor - right */}
        <div style={{
          backgroundColor: '#333',
          padding: '8px',
          borderRadius: '8px',
          border: '3px solid #222',
          boxShadow: '4px 4px 0 #111',
        }}>
          <div style={{
            width: '100px',
            height: '75px',
            backgroundColor: '#0a1a0a',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Waveform lines */}
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: `${20 + i * 15}%`,
                height: '1px',
                backgroundColor: '#0f0',
                opacity: 0.3,
              }} />
            ))}
            {/* Fake waveform */}
            <svg viewBox="0 0 100 75" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <path d="M0 40 Q10 20 20 35 T40 30 T60 45 T80 25 T100 40" stroke="#0f0" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <div style={{ textAlign: 'center', marginTop: '4px', color: '#666', fontSize: '8px' }}>WAVEFORM</div>
        </div>
      </div>

      {/* VCR DECK */}
      <div style={{
        position: 'absolute',
        bottom: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1a1a1a',
        padding: '15px 25px',
        borderRadius: '8px',
        border: '3px solid #333',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        {/* Tape slot */}
        <div style={{
          width: '100px',
          height: '20px',
          backgroundColor: '#0a0a0a',
          border: '2px solid #333',
          borderRadius: '2px',
        }} />

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => changeVideo('prev')} style={{
            backgroundColor: '#333', border: '2px solid #444', borderRadius: '4px',
            padding: '8px 12px', color: '#fff', cursor: 'pointer', fontFamily: 'monospace', fontSize: '10px',
          }}>◀◀ REW</button>
          <button style={{
            backgroundColor: '#333', border: '2px solid #444', borderRadius: '4px',
            padding: '8px 12px', color: '#0f0', cursor: 'pointer', fontFamily: 'monospace', fontSize: '10px',
          }}>▶ PLAY</button>
          <button onClick={() => changeVideo('next')} style={{
            backgroundColor: '#333', border: '2px solid #444', borderRadius: '4px',
            padding: '8px 12px', color: '#fff', cursor: 'pointer', fontFamily: 'monospace', fontSize: '10px',
          }}>FF ▶▶</button>
        </div>

        {/* Counter */}
        <div style={{
          backgroundColor: '#0a0a0a',
          padding: '4px 8px',
          borderRadius: '2px',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#0f0',
        }}>
          {String(currentIndex * 127).padStart(4, '0')}
        </div>
      </div>

      {/* Subscribe section */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '15px 25px',
        borderRadius: '8px',
        border: '2px solid #444',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '12px',
          color: '#fff',
          margin: '0 0 10px 0',
          fontFamily: 'monospace',
          letterSpacing: '2px',
        }}>
          FRIENDS DOING FUN THINGS
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              backgroundColor: '#1a1a1a',
              border: '2px solid #444',
              padding: '8px 12px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#0f0',
              width: '160px',
              borderRadius: '4px',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              backgroundColor: '#333',
              border: '2px solid #0f0',
              padding: '8px 16px',
              color: '#0f0',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '11px',
              borderRadius: '4px',
            }}
          >
            {status === 'loading' ? '...' : 'REC ●'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: '8px', fontSize: '10px', color: status === 'error' ? '#ff4444' : '#0f0' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
