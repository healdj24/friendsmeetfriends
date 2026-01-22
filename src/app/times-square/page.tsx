'use client';

import { useMemo, useState } from 'react';

type Channel = { label: string; youtubeId: string };

const CHANNELS: Channel[] = [
  { label: 'NYC 1960s', youtubeId: '5qap5aO4i9A' },
  { label: 'Street Life', youtubeId: 'DWcJFNfaw9c' },
  { label: 'Jazz Vibes', youtubeId: 'hHW1oY26kxQ' },
];

function Scanlines() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)', pointerEvents: 'none', zIndex: 3 }} />
  );
}

function StaticNoise({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#111', zIndex: 5, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: '-50%', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', animation: 'staticMove 0.1s steps(10) infinite' }} />
      <style>{`@keyframes staticMove { 0% { transform: translate(0,0); } 50% { transform: translate(-3%,-3%); } 100% { transform: translate(3%,3%); } }`}</style>
    </div>
  );
}

function YouTubeEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const src = useMemo(() => {
    const params = new URLSearchParams({ autoplay: '1', mute: '1', controls: '0', modestbranding: '1', rel: '0', playsinline: '1', loop: '1' });
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
  }, [youtubeId]);
  return <iframe key={youtubeId} title={title} src={src} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, filter: 'contrast(1.1) saturate(0.85) brightness(0.92) sepia(0.15)', transform: 'scale(1.02)' }} />;
}

export default function TimesSquare() {
  const [index, setIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const [editing, setEditing] = useState(false);
  const [left, setLeft] = useState(37);
  const [top, setTop] = useState(43);
  const [width, setWidth] = useState(40);
  const [height, setHeight] = useState(26);
  const current = CHANNELS[index]!;

  const change = (dir: 'next' | 'prev') => {
    setShowStatic(true);
    setTimeout(() => {
      setIndex((prev) => (dir === 'next' ? (prev + 1) % CHANNELS.length : (prev - 1 + CHANNELS.length) % CHANNELS.length));
      setTimeout(() => setShowStatic(false), 250);
    }, 150);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>

      <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
        <img src="/nycold.jpg" alt="1960s Times Square" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} />

        <div
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
            transform: 'perspective(800px) rotateY(-2deg) rotateZ(0.5deg)',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: '#000',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <YouTubeEmbed youtubeId={current.youtubeId} title={current.label} />
          <Scanlines />
          <StaticNoise visible={showStatic} />
        </div>
      </div>

      {/* EDITING CONTROLS */}
      {editing && (
        <div style={{ marginTop: '16px', background: '#1a1a1a', padding: '16px', borderRadius: '8px', border: '1px solid #333', width: '100%', maxWidth: '400px' }}>
          <div style={{ color: '#fff', fontSize: '12px', marginBottom: '12px' }}>Adjust overlay position:</div>

          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ color: '#888', fontSize: '12px' }}>Left:</label>
            <input type="range" min="0" max="70" value={left} onChange={(e) => setLeft(Number(e.target.value))} />
            <span style={{ color: '#fff', fontSize: '12px' }}>{left}%</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ color: '#888', fontSize: '12px' }}>Top:</label>
            <input type="range" min="0" max="80" value={top} onChange={(e) => setTop(Number(e.target.value))} />
            <span style={{ color: '#fff', fontSize: '12px' }}>{top}%</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ color: '#888', fontSize: '12px' }}>Width:</label>
            <input type="range" min="10" max="60" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
            <span style={{ color: '#fff', fontSize: '12px' }}>{width}%</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ color: '#888', fontSize: '12px' }}>Height:</label>
            <input type="range" min="5" max="40" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            <span style={{ color: '#fff', fontSize: '12px' }}>{height}%</span>
          </div>

          <button
            onClick={() => setEditing(false)}
            style={{ width: '100%', padding: '12px', background: '#22c55e', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            Done - Lock It In
          </button>

          <div style={{ marginTop: '8px', color: '#666', fontSize: '10px', textAlign: 'center' }}>
            Values: left={left}% top={top}% width={width}% height={height}%
          </div>
        </div>
      )}

      {/* Channel controls */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
        <button onClick={() => change('prev')} style={{ border: '2px solid #444', background: '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>◀ Prev</button>
        <div style={{ color: '#888', fontSize: '12px', minWidth: '80px', textAlign: 'center' }}>{current.label}</div>
        <button onClick={() => change('next')} style={{ border: '2px solid #444', background: '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Next ▶</button>
        {!editing && <button onClick={() => setEditing(true)} style={{ border: '2px solid #666', background: 'transparent', color: '#666', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>}
      </div>
    </div>
  );
}
