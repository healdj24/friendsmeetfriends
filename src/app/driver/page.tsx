'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function DriverPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const passwordRef = useRef('');

  // Keep password ref in sync
  useEffect(() => {
    passwordRef.current = password;
  }, [password]);

  // Send location to server
  const sendLocation = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/car-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          password: passwordRef.current,
          is_active: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      setLastUpdate(new Date());
      setCurrentLocation({ lat, lng });
      setStatus('active');
    } catch (err) {
      console.error('Failed to send location:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send location');
    }
  }, []);

  // Start sharing location
  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported');
      return;
    }

    setStatus('starting');
    setErrorMsg('');

    // Watch position continuously
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('Location permission denied. Please enable in settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('Location unavailable');
            break;
          case error.TIMEOUT:
            setErrorMsg('Location request timed out');
            break;
          default:
            setErrorMsg('Unknown error getting location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Always get fresh location
      }
    );

    watchIdRef.current = watchId;
    setSharing(true);
  }, [sendLocation]);

  // Stop sharing location
  const stopSharing = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Mark as inactive in database
    try {
      await fetch('/api/car-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: currentLocation?.lat || 0,
          longitude: currentLocation?.lng || 0,
          password: passwordRef.current,
          is_active: false,
        }),
      });
    } catch (err) {
      console.error('Failed to mark inactive:', err);
    }

    setSharing(false);
    setStatus('idle');
  }, [currentLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Password screen
  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: 20,
      }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Driver Mode</h1>
        <p style={{ color: '#888', marginBottom: 24 }}>Enter password to start sharing location</p>

        <form onSubmit={(e) => {
          e.preventDefault();
          setAuthenticated(true);
        }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              padding: '12px 16px',
              fontSize: 16,
              background: '#222',
              border: '1px solid #444',
              borderRadius: 8,
              color: '#fff',
              width: 200,
              marginBottom: 16,
            }}
          />
          <br />
          <button
            type="submit"
            disabled={!password}
            style={{
              padding: '12px 32px',
              fontSize: 16,
              background: password ? '#22C55E' : '#444',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: password ? 'pointer' : 'not-allowed',
              fontWeight: 600,
            }}
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  // Main driver interface
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: 20,
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        {sharing ? '📍 Sharing Location' : '🚗 Driver Mode'}
      </h1>

      {status === 'active' && (
        <div style={{
          background: '#22C55E',
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 12,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{
            width: 8,
            height: 8,
            background: '#fff',
            borderRadius: '50%',
            animation: 'pulse 1s infinite',
          }} />
          LIVE
        </div>
      )}

      {currentLocation && sharing && (
        <p style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
          {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </p>
      )}

      {lastUpdate && sharing && (
        <p style={{ color: '#666', fontSize: 12, marginBottom: 24 }}>
          Last update: {lastUpdate.toLocaleTimeString()}
        </p>
      )}

      {errorMsg && (
        <p style={{ color: '#EF4444', marginBottom: 24, fontSize: 14 }}>
          {errorMsg}
        </p>
      )}

      {!sharing ? (
        <button
          onClick={startSharing}
          disabled={status === 'starting'}
          style={{
            padding: '20px 48px',
            fontSize: 20,
            background: status === 'starting' ? '#444' : '#22C55E',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            cursor: status === 'starting' ? 'wait' : 'pointer',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
          }}
        >
          {status === 'starting' ? 'Starting...' : 'Start Sharing'}
        </button>
      ) : (
        <button
          onClick={stopSharing}
          style={{
            padding: '20px 48px',
            fontSize: 20,
            background: '#EF4444',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
          }}
        >
          Stop Sharing
        </button>
      )}

      <p style={{ color: '#666', fontSize: 12, marginTop: 40, maxWidth: 280 }}>
        Keep this page open while driving. Location updates every few seconds.
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
