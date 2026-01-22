'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Channel = { label: string; youtubeId: string };

const CHANNELS: Channel[] = [
  { label: 'Channel 01', youtubeId: '5qap5aO4i9A' },
  { label: 'Channel 02', youtubeId: 'DWcJFNfaw9c' },
  { label: 'Channel 03', youtubeId: 'hHW1oY26kxQ' },
];

type OverlayConfig = {
  x: number; // px
  y: number; // px
  w: number; // px
  h: number; // px
  perspective: number; // px
  rotateX: number; // deg
  rotateY: number; // deg
  rotateZ: number; // deg
  skewX: number; // deg
  skewY: number; // deg
  scale: number; // 1 = normal
  opacity: number; // 0..1
};

const DEFAULT_CONFIG: OverlayConfig = {
  x: 520,
  y: 205,
  w: 330,
  h: 220,
  perspective: 900,
  rotateX: 2,
  rotateY: -14,
  rotateZ: 1.2,
  skewX: 0,
  skewY: 0,
  scale: 1,
  opacity: 1,
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
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
        filter: 'contrast(1.12) saturate(0.9) brightness(0.95) blur(0.3px)',
        transform: 'scale(1.02)',
      }}
    />
  );
}

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

function Vignette() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.30) 70%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    />
  );
}

export default function BillboardCalibrate() {
  const [index, setIndex] = useState(0);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<OverlayConfig>(DEFAULT_CONFIG);
  const [showGuides, setShowGuides] = useState(true);
  const current = CHANNELS[index]!;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startOverlayX: number; startOverlayY: number; active: boolean } | null>(null);

  useEffect(() => {
    return () => {
      if (bgUrl?.startsWith('blob:')) URL.revokeObjectURL(bgUrl);
    };
  }, [bgUrl]);

  const overlayTransform = useMemo(() => {
    return [
      `perspective(${config.perspective}px)`,
      `rotateX(${config.rotateX}deg)`,
      `rotateY(${config.rotateY}deg)`,
      `rotateZ(${config.rotateZ}deg)`,
      `skewX(${config.skewX}deg)`,
      `skewY(${config.skewY}deg)`,
      `scale(${config.scale})`,
    ].join(' ');
  }, [config]);

  const onPointerDown = (e: React.PointerEvent) => {
    // Only start drag if the user clicks the overlay itself.
    const el = e.currentTarget as HTMLDivElement;
    el.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startOverlayX: config.x, startOverlayY: config.y, active: true };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    setConfig((prev) => ({ ...prev, x: Math.round(d.startOverlayX + dx), y: Math.round(d.startOverlayY + dy) }));
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    if (!d) return;
    d.active = false;
  };

  const copyConfig = async () => {
    const payload = JSON.stringify(config, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      // eslint-disable-next-line no-alert
      alert('Copied overlay config JSON to clipboard.');
    } catch {
      // eslint-disable-next-line no-alert
      alert('Could not copy to clipboard. Your browser may block clipboard access.');
    }
  };

  const reset = () => setConfig(DEFAULT_CONFIG);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0b1020 0%, #070814 100%)',
        color: '#fff',
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 360px) 1fr',
        gap: 18,
        padding: 18,
        fontFamily: 'Verdana, Arial, sans-serif',
      }}
    >
      {/* Controls */}
      <aside
        style={{
          borderRadius: 14,
          padding: 14,
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          height: 'calc(100vh - 36px)',
          overflow: 'auto',
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.75, letterSpacing: '0.12em', marginBottom: 10 }}>BILLBOARD CALIBRATOR</div>
        <div style={{ fontSize: 13, lineHeight: 1.4, opacity: 0.85, marginBottom: 14 }}>
          Upload a photo, then drag the overlay onto the sign. Use sliders to match the plane. When it looks right, copy the JSON and reuse it in a
          real scene.
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Background image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = URL.createObjectURL(f);
                setBgUrl((prev) => {
                  if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
                  return url;
                });
              }}
            />
          </label>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIndex((p) => (p + 1) % CHANNELS.length)}
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Swap video
            </button>
            <button
              onClick={() => setShowGuides((v) => !v)}
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              {showGuides ? 'Hide guides' : 'Show guides'}
            </button>
            <button
              onClick={copyConfig}
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Copy JSON
            </button>
            <button
              onClick={reset}
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>

          <div style={{ fontSize: 12, opacity: 0.75 }}>Now playing: {current.label}</div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '8px 0' }} />

          {/* Sliders */}
          <Slider label="x" value={config.x} min={-2000} max={2000} step={1} onChange={(v) => setConfig((p) => ({ ...p, x: v }))} />
          <Slider label="y" value={config.y} min={-2000} max={2000} step={1} onChange={(v) => setConfig((p) => ({ ...p, y: v }))} />
          <Slider label="w" value={config.w} min={50} max={2000} step={1} onChange={(v) => setConfig((p) => ({ ...p, w: v }))} />
          <Slider label="h" value={config.h} min={50} max={2000} step={1} onChange={(v) => setConfig((p) => ({ ...p, h: v }))} />

          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '8px 0' }} />

          <Slider
            label="perspective"
            value={config.perspective}
            min={200}
            max={2000}
            step={10}
            onChange={(v) => setConfig((p) => ({ ...p, perspective: v }))}
          />
          <Slider label="rotateX" value={config.rotateX} min={-45} max={45} step={0.1} onChange={(v) => setConfig((p) => ({ ...p, rotateX: v }))} />
          <Slider label="rotateY" value={config.rotateY} min={-45} max={45} step={0.1} onChange={(v) => setConfig((p) => ({ ...p, rotateY: v }))} />
          <Slider label="rotateZ" value={config.rotateZ} min={-30} max={30} step={0.1} onChange={(v) => setConfig((p) => ({ ...p, rotateZ: v }))} />
          <Slider label="skewX" value={config.skewX} min={-30} max={30} step={0.1} onChange={(v) => setConfig((p) => ({ ...p, skewX: v }))} />
          <Slider label="skewY" value={config.skewY} min={-30} max={30} step={0.1} onChange={(v) => setConfig((p) => ({ ...p, skewY: v }))} />
          <Slider label="scale" value={config.scale} min={0.25} max={2.5} step={0.01} onChange={(v) => setConfig((p) => ({ ...p, scale: v }))} />
          <Slider
            label="opacity"
            value={config.opacity}
            min={0.1}
            max={1}
            step={0.01}
            onChange={(v) => setConfig((p) => ({ ...p, opacity: clamp(v, 0.1, 1) }))}
          />
        </div>
      </aside>

      {/* Stage */}
      <main
        style={{
          borderRadius: 14,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(0,0,0,0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          height: 'calc(100vh - 36px)',
        }}
      >
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          {!bgUrl && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                color: 'rgba(255,255,255,0.7)',
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div style={{ maxWidth: 520, lineHeight: 1.5 }}>
                Upload a photo on the left. Then drag the overlay to the billboard and tweak perspective/rotations until it sits cleanly on the sign.
              </div>
            </div>
          )}

          {/* Overlay */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: 'absolute',
              left: config.x,
              top: config.y,
              width: config.w,
              height: config.h,
              transform: overlayTransform,
              transformOrigin: 'center',
              borderRadius: 10,
              overflow: 'hidden',
              backgroundColor: '#000',
              opacity: config.opacity,
              boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
              cursor: 'grab',
              touchAction: 'none',
            }}
            aria-label="Video overlay (drag me)"
          >
            <YouTubeEmbed youtubeId={current.youtubeId} title={current.label} />
            <Scanlines />
            <Vignette />

            {/* Glare */}
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

          {/* Guides */}
          {showGuides && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, padding: 10, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Drag overlay. Use sliders to match the plane.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 12, opacity: 0.8 }}>{label}</span>
        <code style={{ fontSize: 12, opacity: 0.85 }}>{Number.isInteger(step) ? Math.round(value) : value.toFixed(2)}</code>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

