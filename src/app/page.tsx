'use client';

import { useState } from 'react';

// Hand-drawn smiley face - no circle, just the face features
function SmileyFace() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <circle cx="8" cy="9" r="2" fill="currentColor" />
      <circle cx="16" cy="9" r="2" fill="currentColor" />
      <path
        d="M6.5 14c1.5 2.5 4 4 6 4 2 0 4.5-1.5 6-4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('You\'re in!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#fffff8',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.6\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        fontFamily: 'Verdana, Arial, sans-serif',
      }}
    >
      <main
        style={{
          textAlign: 'center',
          maxWidth: '500px',
          padding: '40px',
          backgroundColor: '#fffff8',
          border: '1px solid #ccc',
          boxShadow: '4px 4px 0px #999',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.6\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        }}
      >
        <h1
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#990000',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: "Georgia, 'Times New Roman', Times, serif",
          }}
        >
          Friends Doing Fun Things
        </h1>

        <p
          style={{
            fontSize: '14px',
            marginBottom: '32px',
            lineHeight: '1.6',
            color: '#333',
          }}
        >
          A community for people who&apos;d rather be somewhere than scroll about it.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              border: '2px solid',
              borderColor: '#888 #fff #fff #888',
              padding: '6px 12px',
              fontSize: '14px',
              fontFamily: 'Verdana, Arial, sans-serif',
              width: '200px',
              height: '32px',
              boxSizing: 'border-box',
              boxShadow: '2px 2px 0px #666',
              backgroundColor: '#fff',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              border: '2px solid',
              borderColor: '#fff #888 #888 #fff',
              backgroundColor: '#c9c9ff',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #666',
              boxSizing: 'border-box',
            }}
            title="Join us"
          >
            {status === 'loading' ? '...' : <SmileyFace />}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: '12px',
              fontSize: '12px',
              color: status === 'error' ? '#cc0000' : '#006600',
            }}
          >
            {message}
          </p>
        )}
      </main>
    </div>
  );
}
