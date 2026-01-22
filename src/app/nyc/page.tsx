'use client';

import { useMemo } from 'react';

const YOUTUBE_ID = 'qRv7G7WpOoU';

function Scanlines() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)', pointerEvents: 'none', zIndex: 3 }} />
  );
}

function YouTubeEmbed({ youtubeId }: { youtubeId: string }) {
  const src = useMemo(() => {
    const params = new URLSearchParams({ autoplay: '1', mute: '1', controls: '0', modestbranding: '1', rel: '0', playsinline: '1', loop: '1', playlist: youtubeId });
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
  }, [youtubeId]);
  return <iframe title="NYC" src={src} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, filter: 'contrast(1.1) saturate(0.85) brightness(0.92) sepia(0.15)', transform: 'scale(1.02)' }} />;
}

export default function NYC() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
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
          <YouTubeEmbed youtubeId={YOUTUBE_ID} />
          <Scanlines />
        </div>
      </div>
    </div>
  );
}
