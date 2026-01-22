'use client';

import { useState } from 'react';

// Video playlist
const videos = [
  { id: 1, src: '/videos/sample1.mp4', title: 'Summer in the City', date: 'JULY 1994', channel: 3 },
  { id: 2, src: '/videos/sample2.mp4', title: 'Central Park Picnic', date: 'AUG 1995', channel: 5 },
  { id: 3, src: '/videos/sample3.mp4', title: 'Rooftop Party', date: 'SEP 1992', channel: 7 },
  { id: 4, src: '/videos/sample4.mp4', title: 'Street Fair', date: 'OCT 1993', channel: 9 },
  { id: 5, src: '/videos/sample5.mp4', title: 'Stoop Hangs', date: 'JUN 1996', channel: 11 },
];

// Scanlines overlay
function Scanlines() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
      pointerEvents: 'none', zIndex: 10,
    }} />
  );
}

// Static noise
function StaticNoise({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#111', zIndex: 20, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        animation: 'staticMove 0.1s steps(10) infinite',
      }} />
      <style>{`@keyframes staticMove { 0% { transform: translate(0,0); } 50% { transform: translate(-5%,-5%); } 100% { transform: translate(5%,5%); } }`}</style>
    </div>
  );
}

export default function TVIllustrated() {
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
      backgroundColor: '#87CEEB',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Comic Sans MS', cursive",
    }}>
      {/* Sky gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(180deg, #5da9e9 0%, #87CEEB 50%, #ffecd2 100%)',
      }} />

      {/* Sun */}
      <div style={{
        position: 'absolute', top: '8%', right: '15%',
        width: '60px', height: '60px', borderRadius: '50%',
        backgroundColor: '#FFD93D',
        boxShadow: '0 0 40px #FFD93D',
      }} />

      {/* Buildings - Background */}
      <svg viewBox="0 0 800 600" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {/* Far building left */}
        <path d="M20 250 L20 600 L120 600 L120 220 L100 220 L100 250 Z" fill="#8B7355" stroke="#5C4033" strokeWidth="2" />
        <rect x="35" y="270" width="20" height="30" fill="#2C3E50" stroke="#1a252f" strokeWidth="1" />
        <rect x="65" y="270" width="20" height="30" fill="#2C3E50" stroke="#1a252f" strokeWidth="1" />
        <rect x="35" y="320" width="20" height="30" fill="#87CEEB" stroke="#1a252f" strokeWidth="1" />
        <rect x="65" y="320" width="20" height="30" fill="#FFE4B5" stroke="#1a252f" strokeWidth="1" />
        <rect x="35" y="370" width="20" height="30" fill="#2C3E50" stroke="#1a252f" strokeWidth="1" />
        <rect x="65" y="370" width="20" height="30" fill="#2C3E50" stroke="#1a252f" strokeWidth="1" />

        {/* Water tower */}
        <ellipse cx="70" cy="210" rx="30" ry="15" fill="#8B4513" stroke="#5C4033" strokeWidth="2" />
        <rect x="45" y="210" width="50" height="30" fill="#8B4513" stroke="#5C4033" strokeWidth="2" />
        <line x1="50" y1="240" x2="50" y2="250" stroke="#5C4033" strokeWidth="3" />
        <line x1="90" y1="240" x2="90" y2="250" stroke="#5C4033" strokeWidth="3" />

        {/* Main brownstone - center */}
        <path d="M180 280 L180 600 L380 600 L380 280 L360 260 L200 260 Z" fill="#CD853F" stroke="#8B4513" strokeWidth="3" />

        {/* Brownstone details - cornice */}
        <rect x="175" y="275" width="210" height="8" fill="#8B4513" />
        <rect x="175" y="260" width="210" height="5" fill="#A0522D" />

        {/* Windows row 1 */}
        <rect x="200" y="300" width="35" height="50" fill="#2C3E50" stroke="#5C4033" strokeWidth="2" rx="2" />
        <rect x="200" y="300" width="35" height="8" fill="#8B4513" />
        <rect x="260" y="300" width="35" height="50" fill="#FFE4B5" stroke="#5C4033" strokeWidth="2" rx="2" />
        <rect x="260" y="300" width="35" height="8" fill="#8B4513" />
        <rect x="320" y="300" width="35" height="50" fill="#2C3E50" stroke="#5C4033" strokeWidth="2" rx="2" />
        <rect x="320" y="300" width="35" height="8" fill="#8B4513" />

        {/* Windows row 2 */}
        <rect x="200" y="370" width="35" height="50" fill="#87CEEB" stroke="#5C4033" strokeWidth="2" rx="2" />
        <rect x="260" y="370" width="35" height="50" fill="#2C3E50" stroke="#5C4033" strokeWidth="2" rx="2" />
        <rect x="320" y="370" width="35" height="50" fill="#FFE4B5" stroke="#5C4033" strokeWidth="2" rx="2" />

        {/* Fire escape */}
        <g stroke="#333" strokeWidth="2" fill="none">
          <rect x="195" y="295" width="45" height="60" />
          <rect x="195" y="365" width="45" height="60" />
          <line x1="195" y1="355" x2="175" y2="365" />
          <line x1="240" y1="355" x2="240" y2="365" />
          <line x1="195" y1="425" x2="175" y2="435" />
        </g>

        {/* Stoop */}
        <path d="M250 600 L250 520 L310 520 L310 600" fill="#A0522D" stroke="#8B4513" strokeWidth="2" />
        <rect x="245" y="520" width="70" height="10" fill="#8B4513" />
        <rect x="250" y="540" width="60" height="8" fill="#CD853F" />
        <rect x="250" y="560" width="60" height="8" fill="#CD853F" />
        <rect x="250" y="580" width="60" height="8" fill="#CD853F" />

        {/* Door */}
        <rect x="260" y="450" width="40" height="70" fill="#5C4033" stroke="#3d2817" strokeWidth="2" rx="3" />
        <circle cx="290" cy="485" r="3" fill="#FFD700" />

        {/* Right building */}
        <rect x="420" y="200" width="150" height="400" fill="#DEB887" stroke="#8B7355" strokeWidth="3" />
        <rect x="440" y="220" width="30" height="40" fill="#2C3E50" stroke="#5C4033" strokeWidth="1" />
        <rect x="490" y="220" width="30" height="40" fill="#87CEEB" stroke="#5C4033" strokeWidth="1" />
        <rect x="540" y="220" width="20" height="40" fill="#2C3E50" stroke="#5C4033" strokeWidth="1" />
        <rect x="440" y="280" width="30" height="40" fill="#FFE4B5" stroke="#5C4033" strokeWidth="1" />
        <rect x="490" y="280" width="30" height="40" fill="#2C3E50" stroke="#5C4033" strokeWidth="1" />
        <rect x="540" y="280" width="20" height="40" fill="#FFE4B5" stroke="#5C4033" strokeWidth="1" />
        <rect x="440" y="340" width="30" height="40" fill="#2C3E50" stroke="#5C4033" strokeWidth="1" />
        <rect x="490" y="340" width="30" height="40" fill="#87CEEB" stroke="#5C4033" strokeWidth="1" />

        {/* Bodega awning */}
        <path d="M420 420 L570 420 L580 450 L410 450 Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="2" />
        <text x="450" y="442" fill="#fff" fontSize="14" fontFamily="Arial Black">DELI</text>

        {/* Far right building */}
        <rect x="600" y="180" width="200" height="420" fill="#B8860B" stroke="#8B6914" strokeWidth="3" />
        <rect x="620" y="200" width="25" height="35" fill="#2C3E50" stroke="#5C4033" strokeWidth="1" />
        <rect x="660" y="200" width="25" height="35" fill="#2C3E50" stroke="#5C4033" strokeWidth="1" />
        <rect x="700" y="200" width="25" height="35" fill="#FFE4B5" stroke="#5C4033" strokeWidth="1" />
        <rect x="740" y="200" width="25" height="35" fill="#2C3E50" stroke="#5C4033" strokeWidth="1" />

        {/* Street */}
        <rect x="0" y="530" width="800" height="70" fill="#444" />
        <line x1="0" y1="565" x2="800" y2="565" stroke="#FFD700" strokeWidth="3" strokeDasharray="30,20" />

        {/* Sidewalk */}
        <rect x="0" y="500" width="800" height="30" fill="#999" stroke="#777" strokeWidth="1" />
        <line x1="50" y1="500" x2="50" y2="530" stroke="#777" strokeWidth="1" />
        <line x1="150" y1="500" x2="150" y2="530" stroke="#777" strokeWidth="1" />
        <line x1="400" y1="500" x2="400" y2="530" stroke="#777" strokeWidth="1" />
        <line x1="550" y1="500" x2="550" y2="530" stroke="#777" strokeWidth="1" />
        <line x1="700" y1="500" x2="700" y2="530" stroke="#777" strokeWidth="1" />

        {/* Street lamp */}
        <rect x="140" y="350" width="8" height="150" fill="#333" />
        <ellipse cx="144" cy="350" rx="20" ry="10" fill="#333" />
        <ellipse cx="144" cy="345" rx="12" ry="6" fill="#FFFACD" />

        {/* Trash cans */}
        <ellipse cx="600" cy="510" rx="15" ry="8" fill="#666" />
        <rect x="585" y="480" width="30" height="30" fill="#555" stroke="#444" strokeWidth="2" />
        <ellipse cx="600" cy="480" rx="15" ry="5" fill="#666" />
      </svg>

      {/* THE TV - positioned on the sidewalk */}
      <div style={{
        position: 'absolute',
        bottom: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
      }}>
        {/* TV Stand / Milk crate */}
        <div style={{
          position: 'absolute',
          bottom: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '30px',
          backgroundColor: '#8B4513',
          border: '3px solid #5C4033',
          borderRadius: '2px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '2px',
          padding: '3px',
        }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ backgroundColor: '#3d2817', borderRadius: '1px' }} />
          ))}
        </div>

        {/* TV Body */}
        <div style={{
          backgroundColor: '#DEB887',
          background: 'linear-gradient(145deg, #DEB887 0%, #D2B48C 50%, #C4A97A 100%)',
          borderRadius: '15px',
          padding: '15px',
          border: '4px solid #8B7355',
          boxShadow: '5px 5px 0px #5C4033, inset 2px 2px 0px rgba(255,255,255,0.3)',
          width: '280px',
        }}>
          {/* Brand name */}
          <div style={{
            textAlign: 'center',
            fontSize: '10px',
            color: '#5C4033',
            fontFamily: 'Arial Black',
            letterSpacing: '3px',
            marginBottom: '5px',
          }}>
            FRIENDVISION
          </div>

          {/* Screen bezel */}
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '10px',
            padding: '10px',
            border: '3px solid #1a1a1a',
          }}>
            {/* Screen */}
            <div style={{
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: '40px / 30px',
              overflow: 'hidden',
              aspectRatio: '4/3',
            }}>
              {/* Video placeholder */}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
              }}>
                <div style={{ fontSize: '32px' }}>📺</div>
                <div style={{ fontSize: '11px', marginTop: '5px' }}>{currentVideo.title}</div>
              </div>

              {/* Channel display */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#0f0',
                textShadow: '0 0 5px #0f0',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '2px 6px',
              }}>
                CH {currentVideo.channel}
              </div>

              {/* Date */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#fff',
                textShadow: '1px 1px 0 #000',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '2px 4px',
              }}>
                {currentVideo.date}
              </div>

              <Scanlines />
              <StaticNoise visible={showStatic} />

              {/* Screen glare */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px',
            padding: '0 5px',
          }}>
            {/* Speaker grille */}
            <div style={{
              width: '50px',
              height: '35px',
              background: 'repeating-linear-gradient(0deg, #8B7355 0px, #8B7355 2px, #6B5344 2px, #6B5344 4px)',
              borderRadius: '3px',
            }} />

            {/* Knobs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => changeChannel('down')}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #4a4a4a, #2a2a2a)',
                  border: '2px solid #1a1a1a',
                  cursor: 'pointer',
                  color: '#888',
                  fontSize: '12px',
                }}
              >◀</button>
              <button
                onClick={() => changeChannel('up')}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #4a4a4a, #2a2a2a)',
                  border: '2px solid #1a1a1a',
                  cursor: 'pointer',
                  color: '#888',
                  fontSize: '12px',
                }}
              >▶</button>
            </div>

            {/* Power LED */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#0f0',
              boxShadow: '0 0 5px #0f0',
            }} />
          </div>
        </div>
      </div>

      {/* Subscribe section - bottom */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: '15px 25px',
        borderRadius: '10px',
        border: '3px solid #5C4033',
        boxShadow: '4px 4px 0px #5C4033',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#5C4033',
          margin: '0 0 8px 0',
          fontFamily: "'Georgia', serif",
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
              border: '2px solid #5C4033',
              padding: '8px 12px',
              fontSize: '12px',
              width: '160px',
              borderRadius: '5px',
              fontFamily: "'Georgia', serif",
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              backgroundColor: '#CD853F',
              border: '2px solid #5C4033',
              padding: '8px 16px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              borderRadius: '5px',
              fontFamily: "'Georgia', serif",
              fontWeight: 'bold',
            }}
          >
            {status === 'loading' ? '...' : 'JOIN'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: '8px', fontSize: '11px', color: status === 'error' ? '#c00' : '#060' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
