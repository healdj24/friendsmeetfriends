'use client';

import { useState } from 'react';

// Hand-drawn smiley face SVG - looks like dry-erase marker on whiteboard
function SmileyFace() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Face outline - slightly wobbly circle */}
      <path
        d="M12 2.5c-1.8 0-3.6.4-5.2 1.3-1.5.8-2.8 2-3.7 3.5-.9 1.4-1.4 3.1-1.5 4.8 0 1.7.4 3.4 1.2 4.9.9 1.5 2.1 2.8 3.6 3.7 1.5.9 3.2 1.4 5 1.4 1.7 0 3.4-.4 4.9-1.2 1.5-.8 2.8-2 3.8-3.4 1-1.5 1.5-3.2 1.5-5 .1-1.8-.3-3.5-1.1-5.1-.8-1.5-2-2.9-3.4-3.8-1.5-1-3.2-1.5-5.1-1.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left eye - small wobbly dot */}
      <path
        d="M8.5 9.5c.2-.3.5-.5.8-.4.3 0 .5.3.5.6 0 .4-.2.7-.5.8-.3.1-.6-.1-.8-.4-.1-.2-.1-.4 0-.6z"
        fill="currentColor"
      />
      {/* Right eye - small wobbly dot */}
      <path
        d="M14.5 9.2c.2-.2.5-.3.8-.2.3.1.4.4.4.7-.1.3-.3.6-.6.6-.3.1-.6-.1-.7-.4-.1-.3 0-.5.1-.7z"
        fill="currentColor"
      />
      {/* Smile - wobbly curve */}
      <path
        d="M7.5 14.5c.8 1.2 2 2.1 3.4 2.5 1.4.4 2.9.3 4.2-.3.7-.3 1.3-.7 1.8-1.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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
      }}
    >
      <main
        style={{
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(18px, 5vw, 36px)',
            fontWeight: 'normal',
            marginBottom: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          Friends Doing Fun Things
        </h1>

        <p
          style={{
            fontSize: 'clamp(14px, 4vw, 18px)',
            marginBottom: '32px',
            lineHeight: '1.6',
            padding: '0 10px',
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
            className="pg-input"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="pg-button-circle"
            title="Join us"
          >
            {status === 'loading' ? '...' : <SmileyFace />}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: '12px',
              fontSize: '14px',
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
