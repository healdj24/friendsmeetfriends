'use client';

import { useMemo, useState } from 'react';

type Channel = {
  label: string;
  youtubeId: string;
  channelNumber: number;
  timestampLabel: string;
};

const CHANNELS: Channel[] = [
  { label: 'Street Cam', youtubeId: '5qap5aO4i9A', channelNumber: 3, timestampLabel: 'JUL 1994' }, // lofi hip hop radio (example; replace)
  { label: 'Rooftop Vibes', youtubeId: 'DWcJFNfaw9c', channelNumber: 5, timestampLabel: 'AUG 1995' }, // chill music (example; replace)
  { label: 'Late Night', youtubeId: 'hHW1oY26kxQ', channelNumber: 7, timestampLabel: 'SEP 1992' }, // synthwave mix (example; replace)
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
        zIndex: 10,
        mixBlendMode: 'multiply',
      }}
    />
  );
}

function Vignette() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
        zIndex: 11,
      }}
    />
  );
}

function StaticNoise({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
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
  // Muted autoplay tends to work; user can unmute via YouTube UI if controls are enabled.
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
        // “Old-school” vibe: slight blur + contrast + saturation tweaks.
        filter: 'contrast(1.15) saturate(0.85) brightness(0.95) blur(0.25px)',
        transform: 'scale(1.02)',
      }}
    />
  );
}

export default function TVYouTube() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);

  const current = CHANNELS[currentIndex]!;

  const changeChannel = (dir: 'up' | 'down') => {
    setShowStatic(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (dir === 'up' ? (prev + 1) % CHANNELS.length : (prev - 1 + CHANNELS.length) % CHANNELS.length));
      setTimeout(() => setShowStatic(false), 250);
    }, 150);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'radial-gradient(ellipse at top, #2c6aa3 0%, #0b1020 55%, #050712 100%)',
        fontFamily: "Georgia, 'Times New Roman', Times, serif",
      }}
    >
      <div style={{ width: 'min(640px, 96vw)' }}>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, letterSpacing: '0.12em', marginBottom: 10 }}>
          TV demo (YouTube overlay + CRT effects) — swap channels below
        </div>

        {/* TV shell */}
        <div
          style={{
            background: 'linear-gradient(180deg, #b08b58 0%, #8b5e2b 40%, #5b3411 100%)',
            borderRadius: 22,
            padding: 18,
            boxShadow: '0 24px 70px rgba(0,0,0,0.65), inset 0 2px 5px rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: 4, marginBottom: 10 }}>
            FRIENDVISION
          </div>

          {/* Bezel */}
          <div style={{ backgroundColor: '#141414', borderRadius: 16, padding: 14, boxShadow: 'inset 0 6px 30px rgba(0,0,0,0.85)' }}>
            {/* Screen */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '4/3',
                backgroundColor: '#000',
                borderRadius: '52px / 40px',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 65px rgba(0,0,0,0.55)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '4% 3% 5% 3%',
                  borderRadius: '45px / 34px',
                  overflow: 'hidden',
                  background: '#050505',
                }}
              >
                <YouTubeEmbed youtubeId={current.youtubeId} title={current.label} />
              </div>

              {/* OSD */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#35ff5a',
                  textShadow: '0 0 10px rgba(53,255,90,0.9)',
                  background: 'rgba(0,0,0,0.45)',
                  padding: '2px 8px',
                  zIndex: 12,
                }}
              >
                CH {current.channelNumber}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.9)',
                  textShadow: '1px 1px 0 #000',
                  background: 'rgba(0,0,0,0.45)',
                  padding: '2px 6px',
                  zIndex: 12,
                }}
              >
                {current.timestampLabel} — {current.label}
              </div>

              <Scanlines />
              <Vignette />
              <StaticNoise visible={showStatic} />

              {/* Glare */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 52%)',
                  pointerEvents: 'none',
                  zIndex: 9,
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 10px' }}>
            <div
              style={{
                width: 84,
                height: 56,
                borderRadius: 6,
                background: 'repeating-linear-gradient(0deg, #573a22 0px, #573a22 3px, #412816 3px, #412816 6px)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={() => changeChannel('down')}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #3b3b3b, #1f1f1f)',
                  border: '2px solid #0e0e0e',
                  color: '#bdbdbd',
                  cursor: 'pointer',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.09), 0 10px 20px rgba(0,0,0,0.45)',
                  fontSize: 18,
                }}
                aria-label="Channel down"
              >
                ◀
              </button>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, letterSpacing: 2 }}>CHANNEL</div>
              <button
                onClick={() => changeChannel('up')}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #3b3b3b, #1f1f1f)',
                  border: '2px solid #0e0e0e',
                  color: '#bdbdbd',
                  cursor: 'pointer',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.09), 0 10px 20px rgba(0,0,0,0.45)',
                  fontSize: 18,
                }}
                aria-label="Channel up"
              >
                ▶
              </button>
            </div>

            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#35ff5a',
                boxShadow: '0 0 12px rgba(53,255,90,0.9)',
              }}
              aria-label="Power on"
            />
          </div>
        </div>

        <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.4 }}>
          Tip: swap the youtubeIds in CHANNELS at the top of this file. For a photo/cartoon background, put an {'<img>'} behind the TV and
          absolutely-position this screen area on top.
        </div>
      </div>
    </div>
  );
}

