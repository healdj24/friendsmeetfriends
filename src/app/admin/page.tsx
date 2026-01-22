'use client';

import { useState, useEffect } from 'react';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);

  // Fetch subscribers on load
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/subscribers');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (subscribers.length === 0) {
      setStatus('error');
      setMessage('No subscribers to send to');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(`Email sent to ${data.count} subscribers!`);
        setSubject('');
        setBody('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send');
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
        padding: '40px 20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '24px', fontWeight: 'normal', marginBottom: '8px' }}>
        Admin
      </h1>
      <p style={{ fontSize: '14px', marginBottom: '32px', color: '#666' }}>
        Send emails to your subscribers
      </p>

      {/* Subscriber count */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          marginBottom: '24px',
        }}
      >
        <strong>Subscribers:</strong>{' '}
        {loadingSubscribers ? 'Loading...' : subscribers.length}
      </div>

      {/* Compose form */}
      <form onSubmit={handleSend}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="subject"
            style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}
          >
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="pg-input"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="body"
            style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}
          >
            Message
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={10}
            style={{
              width: '100%',
              border: '1px solid #999',
              padding: '8px',
              fontFamily: "Georgia, 'Times New Roman', Times, serif",
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="pg-button"
          style={{ padding: '8px 24px' }}
        >
          {status === 'loading' ? 'Sending...' : 'Send to all subscribers'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: '16px',
            fontSize: '14px',
            color: status === 'error' ? '#cc0000' : '#006600',
          }}
        >
          {message}
        </p>
      )}

      {/* Subscriber list */}
      {subscribers.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'normal', marginBottom: '16px' }}>
            Subscriber list
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {subscribers.map((sub) => (
              <li
                key={sub.id}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px',
                }}
              >
                {sub.email}
                <span style={{ color: '#999', marginLeft: '12px', fontSize: '12px' }}>
                  {new Date(sub.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
