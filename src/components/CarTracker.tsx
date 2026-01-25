'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CarLocation {
  latitude: number;
  longitude: number;
  is_active: boolean;
  updated_at: string;
}

export default function CarTracker() {
  const [location, setLocation] = useState<CarLocation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Fetch location from API
  const fetchLocation = useCallback(async () => {
    try {
      const res = await fetch('/api/car-location');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude) {
          setLocation(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch car location:', err);
    }
  }, []);

  // Poll for location updates
  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [fetchLocation]);

  // Auto-open modal when driver is active (first time only)
  useEffect(() => {
    if (location?.is_active && !hasAutoOpened) {
      setShowModal(true);
      setHasAutoOpened(true);
    }
  }, [location?.is_active, hasAutoOpened]);

  // Initialize/update map when modal opens or location changes
  useEffect(() => {
    if (!showModal || !mapContainerRef.current || !location) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current!, {
          center: [location.latitude, location.longitude],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });

        // Clean, modern map style (CartoDB Positron)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Add subtle zoom control
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Pulsing car marker with glow effect
        const carIcon = L.divIcon({
          className: 'car-marker-icon',
          html: `
            <div class="car-marker-container">
              <div class="car-pulse-ring"></div>
              <div class="car-pulse-ring delay"></div>
              <div class="car-icon">🚗</div>
            </div>
          `,
          iconSize: [60, 60],
          iconAnchor: [30, 30],
        });

        const marker = L.marker([location.latitude, location.longitude], {
          icon: carIcon,
        }).addTo(map);

        mapRef.current = map;
        markerRef.current = marker;

        // Fix map size after render
        setTimeout(() => map.invalidateSize(), 100);
      } else {
        markerRef.current?.setLatLng([location.latitude, location.longitude]);
        mapRef.current?.panTo([location.latitude, location.longitude]);
      }
    };

    initMap();
  }, [showModal, location]);

  // Cleanup map when modal closes
  useEffect(() => {
    if (!showModal && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [showModal]);

  // Don't render anything if car is not active
  if (!location?.is_active) {
    return null;
  }

  return (
    <>
      {/* Small floating button when modal is closed */}
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 100,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: 'none',
            borderRadius: 50,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(16, 185, 129, 0.4), 0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 32px rgba(16, 185, 129, 0.5), 0 4px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(16, 185, 129, 0.4), 0 2px 8px rgba(0,0,0,0.2)';
          }}
        >
          <span style={{ fontSize: 22 }}>🚗</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '0.5px' }}>
            LIVE
          </span>
          <span style={{
            width: 10,
            height: 10,
            background: '#fff',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite',
            boxShadow: '0 0 8px rgba(255,255,255,0.8)',
          }} />
        </button>
      )}

      {/* Full-screen modal with map */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {/* Map container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 600,
              height: '80vh',
              maxHeight: 700,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)',
              animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Map */}
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '100%',
                background: '#f5f5f5',
              }}
            />

            {/* LIVE badge - top center, prominent */}
            <div style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              padding: '10px 24px',
              borderRadius: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              zIndex: 1001,
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4), 0 2px 8px rgba(0,0,0,0.2)',
            }}>
              <span style={{
                width: 10,
                height: 10,
                background: '#fff',
                borderRadius: '50%',
                animation: 'pulse 1s ease-in-out infinite',
                boxShadow: '0 0 12px rgba(255,255,255,0.8)',
              }} />
              <span style={{
                color: '#fff',
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: '2px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                LIVE
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                transition: 'background 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>

            {/* Bottom info bar */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px 24px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
              zIndex: 1001,
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 13,
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                margin: 0,
                textAlign: 'center',
              }}>
                Tap outside to close
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.95); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .car-marker-container {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .car-pulse-ring {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.3);
          animation: pulseRing 2s ease-out infinite;
        }
        .car-pulse-ring.delay {
          animation-delay: 1s;
        }
        @keyframes pulseRing {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .car-icon {
          font-size: 32px;
          z-index: 10;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: rgba(255,255,255,0.95) !important;
          color: #333 !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #fff !important;
        }
      `}</style>
    </>
  );
}
