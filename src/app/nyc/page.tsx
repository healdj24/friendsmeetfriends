'use client';

import { useMemo, useState } from 'react';

const YOUTUBE_ID = 'qRv7G7WpOoU';

function Scanlines() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)', pointerEvents: 'none', zIndex: 3 }} />
  );
}

function YouTubeEmbed({ youtubeId, muted }: { youtubeId: string; muted: boolean }) {
  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: '1',
      mute: muted ? '1' : '0',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
      loop: '1',
      playlist: youtubeId,
    });
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
  }, [youtubeId, muted]);

  return (
    <iframe
      key={muted ? 'muted' : 'unmuted'}
      title="NYC"
      src={src}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
        filter: 'contrast(1.1) saturate(0.85) brightness(0.92) sepia(0.15)',
        transform: 'scale(1.02)',
      }}
    />
  );
}

export default function NYC() {
  const [muted, setMuted] = useState(true);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '16px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
        <img src="/nycold.jpg" alt="1960s Times Square" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} />

        <div
          style={{
            position: 'absolute',
            left: '37%',
            top: '43%',
            width: '40%',
            height: '26%',
            transform: 'perspective(800px) rotateY(-2deg) rotateZ(0.5deg)',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: '#000',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <YouTubeEmbed youtubeId={YOUTUBE_ID} muted={muted} />
          <Scanlines />
        </div>
      </div>

      {muted && (
        <button
          onClick={() => setMuted(false)}
          style={{
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          🔊 Tap to unmute
        </button>
      )}
    </div>
  );
}
