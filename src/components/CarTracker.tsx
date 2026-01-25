'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase-client';

interface CarLocation {
  latitude: number;
  longitude: number;
  is_active: boolean;
  updated_at: string;
}

export default function CarTracker() {
  const [location, setLocation] = useState<CarLocation | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Fetch initial location
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

  // Set up real-time subscription
  useEffect(() => {
    fetchLocation();

    // Subscribe to real-time updates
    const channel = supabaseClient
      .channel('car_location_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'car_location',
        },
        (payload) => {
          const newData = payload.new as CarLocation;
          setLocation(newData);
        }
      )
      .subscribe();

    // Also poll every 10 seconds as backup
    const interval = setInterval(fetchLocation, 10000);

    return () => {
      supabaseClient.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchLocation]);

  // Calculate time since last update
  const getTimeSince = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // Don't render if car is not active
  if (!location?.is_active) {
    return null;
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?ll=${location.latitude},${location.longitude}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 100,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Collapsed state - just a pulsing icon */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: 'linear-gradient(145deg, #22C55E, #16A34A)',
            border: 'none',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
            animation: 'glow 2s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: 20 }}>🚗</span>
          <span style={{
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
          }}>
            LIVE
          </span>
          <span style={{
            width: 8,
            height: 8,
            background: '#fff',
            borderRadius: '50%',
            animation: 'pulse 1s infinite',
          }} />
        </button>
      )}

      {/* Expanded state - show details */}
      {expanded && (
        <div style={{
          background: 'linear-gradient(145deg, rgba(20,20,25,0.98), rgba(10,10,15,0.99))',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          padding: 16,
          minWidth: 200,
          border: '1px solid rgba(34, 197, 94, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🚗</span>
              <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 14 }}>
                JEEP IS LIVE
              </span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: 18,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Last updated */}
          <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
            Updated {getTimeSince(location.updated_at)}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#22C55E',
                borderRadius: 8,
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Google Maps
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#333',
                borderRadius: 8,
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Apple Maps
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 4px 30px rgba(34, 197, 94, 0.6); }
        }
      `}</style>
    </div>
  );
}
