'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function DriverPage() {
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [updateCount, setUpdateCount] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Request wake lock to keep screen on
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.log('Wake lock not available:', err);
    }
  };

  // Release wake lock
  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // Send location to server
  const sendLocation = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/car-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          is_active: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      setStatus('active');
      setUpdateCount(c => c + 1);
    } catch (err) {
      console.error('Failed to send location:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send');
    }
  }, []);

  // Start sharing location
  const startSharing = useCallback(async () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported');
      return;
    }

    setStatus('starting');
    setErrorMsg('');

    // Keep screen on
    await requestWakeLock();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('Location unavailable');
            break;
          case error.TIMEOUT:
            setErrorMsg('Location timed out');
            break;
          default:
            setErrorMsg('Unknown error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
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

    releaseWakeLock();

    try {
      await fetch('/api/car-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: 0,
          longitude: 0,
          is_active: false,
        }),
      });
    } catch (err) {
      console.error('Failed to mark inactive:', err);
    }

    setSharing(false);
    setStatus('idle');
    setUpdateCount(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      releaseWakeLock();
    };
  }, []);

  // Re-acquire wake lock if released (e.g., tab switch on some browsers)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && sharing) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sharing]);

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: sharing ? '#0a0a0a' : '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: 20,
      transition: 'background 0.3s',
    }}>

      {/* Active indicator */}
      {status === 'active' && (
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          padding: '8px 20px',
          borderRadius: 50,
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
        }}>
          <span style={{
            width: 10,
            height: 10,
            background: '#fff',
            borderRadius: '50%',
            animation: 'pulse 1s infinite',
          }} />
          SHARING
        </div>
      )}

      {/* Update counter */}
      {sharing && updateCount > 0 && (
        <p style={{
          color: '#666',
          fontSize: 13,
          marginBottom: 24,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {updateCount} updates sent
        </p>
      )}

      {errorMsg && (
        <p style={{ color: '#EF4444', marginBottom: 20, fontSize: 14 }}>
          {errorMsg}
        </p>
      )}

      {/* Big button */}
      {!sharing ? (
        <button
          onClick={startSharing}
          disabled={status === 'starting'}
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            fontSize: 28,
            background: status === 'starting'
              ? '#333'
              : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: 'none',
            color: '#fff',
            cursor: status === 'starting' ? 'wait' : 'pointer',
            fontWeight: 800,
            boxShadow: status === 'starting'
              ? 'none'
              : '0 0 80px rgba(16, 185, 129, 0.5), 0 8px 32px rgba(0,0,0,0.3)',
            transition: 'all 0.3s',
            letterSpacing: '1px',
          }}
        >
          {status === 'starting' ? '...' : 'START'}
        </button>
      ) : (
        <button
          onClick={stopSharing}
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            fontSize: 28,
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 800,
            boxShadow: '0 0 80px rgba(239, 68, 68, 0.5), 0 8px 32px rgba(0,0,0,0.3)',
            animation: 'breathe 3s ease-in-out infinite',
            letterSpacing: '1px',
          }}
        >
          STOP
        </button>
      )}

      {/* Instructions */}
      <p style={{
        color: '#555',
        fontSize: 13,
        marginTop: 48,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 1.6,
      }}>
        {sharing
          ? 'Keep this page open. You can lock your phone or switch apps.'
          : 'Tap START to begin sharing your location.'
        }
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
