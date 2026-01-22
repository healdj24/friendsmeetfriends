'use client';

import { useMemo, useState } from 'react';

type Channel = { label: string; youtubeId: string };

const CHANNELS: Channel[] = [
  { label: 'Channel 01', youtubeId: '5qap5aO4i9A' },
  { label: 'Channel 02', youtubeId: 'DWcJFNfaw9c' },
  { label: 'Channel 03', youtubeId: 'hHW1oY26kxQ' },
];

function Scanlines() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
        pointerEvents: 'none',
        zIndex: 3,
        mixBlendMode: 'multiply',
      }}
    />
  );
}

function StaticNoise({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#111', zIndex: 5, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          animation: 'staticMove 0.1s steps(10) infinite',
          opacity: 0.95,
        }}
      />
      <style>{`
        @keyframes staticMove {
          0% { transform: translate(0,0); }
          25% { transform: translate(-4%,-2%); }
          50% { transform: translate(3%,4%); }
          75% { transform: translate(-2%,3%); }
          100% { transform: translate(2%,-3%); }
        }
      `}</style>
    </div>
  );
}

function YouTubeEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      controls: '0',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
    });
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
  }, [youtubeId]);

  return (
    <iframe
      key={youtubeId}
      title={title}
      src={src}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
        filter: 'contrast(1.15) saturate(0.85) brightness(0.95) blur(0.25px)',
        transform: 'scale(1.02)',
      }}
    />
  );
}

export default function BillboardDemo() {
  const [index, setIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);
  const current = CHANNELS[index]!;

  const change = (dir: 'next' | 'prev') => {
    setShowStatic(true);
    setTimeout(() => {
      setIndex((prev) => (dir === 'next' ? (prev + 1) % CHANNELS.length : (prev - 1 + CHANNELS.length) % CHANNELS.length));
      setTimeout(() => setShowStatic(false), 250);
    }, 150);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0b1020 0%, #0a1022 40%, #070814 100%)',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        fontFamily: "Verdana, Arial, sans-serif",
      }}
    >
      <div style={{ width: 'min(980px, 96vw)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.75, letterSpacing: '0.12em' }}>
            Billboard demo (perspective “video on a plane”) — imagine this sitting on top of a photo/cartoon background
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Now playing: {current.label}</div>
        </div>

        {/* Simple “NYC-ish” silhouette background */}
        <div
          style={{
            position: 'relative',
            height: 520,
            borderRadius: 18,
            overflow: 'hidden',
            background: 'radial-gradient(ellipse at 30% 20%, rgba(90,160,220,0.55) 0%, rgba(10,16,34,0.95) 55%, rgba(7,8,20,1) 100%)',
            boxShadow: '0 30px 90px rgba(0,0,0,0.65)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Buildings */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.9 }}>
            {[
              { x: 40, w: 110, h: 240, c: '#11162c' },
              { x: 170, w: 160, h: 320, c: '#0f142a' },
              { x: 360, w: 120, h: 280, c: '#111a33' },
              { x: 500, w: 210, h: 360, c: '#0d1227' },
              { x: 730, w: 170, h: 300, c: '#11162c' },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: b.x,
                  bottom: 90,
                  width: b.w,
                  height: b.h,
                  backgroundColor: b.c,
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                  borderRadius: 6,
                }}
              />
            ))}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: '#070814' }} />
          </div>

          {/* “Billboard” mount */}
          <div style={{ position: 'absolute', left: '62%', bottom: 120, transform: 'translateX(-50%)', width: 520 }}>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '100%',
                transform: 'translateX(-50%)',
                width: 26,
                height: 140,
                background: 'linear-gradient(180deg, #2a2d34 0%, #14161c 100%)',
                borderRadius: 8,
                boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
              }}
            />

            {/* Billboard frame */}
            <div
              style={{
                position: 'relative',
                padding: 14,
                borderRadius: 18,
                background: 'linear-gradient(180deg, rgba(220,220,230,0.16) 0%, rgba(120,120,140,0.10) 100%)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 30px 70px rgba(0,0,0,0.7)',
                transform: 'perspective(900px) rotateY(-18deg) rotateX(6deg)',
                transformOrigin: 'center',
              }}
            >
              {/* Screen */}
              <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' }}>
                <YouTubeEmbed youtubeId={current.youtubeId} title={current.label} />
                <Scanlines />
                <StaticNoise visible={showStatic} />

                {/* Glass glare */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
              </div>

              <div style={{ marginTop: 10, fontSize: 11, opacity: 0.75, letterSpacing: '0.08em' }}>BILLBOARD TV</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ position: 'absolute', left: 24, bottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => change('prev')}
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              ◀ Prev
            </button>
            <button
              onClick={() => change('next')}
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              Next ▶
            </button>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Swap videos; keep the “screen” locked to a plane.</div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>
          If you have a real photo/cartoon: set it as the container background (or an {'<img>'}), then position this billboard plane on top. If the
          screen is angled, use perspective + rotateX/Y (or Three.js for true corner pinning).
        </div>
      </div>
    </div>
  );
}

