'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch('/api/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Failed to send');
        return;
      }

      setStatus('success');
      setMessage(`Email sent! ID: ${data.emailId}`);
      // Clear form on success
      setTo('');
      setSubject('');
      setBody('');
    } catch (err) {
      setStatus('error');
      setMessage('Network error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      padding: '40px',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ marginBottom: '30px' }}>Test Email Sender</h1>

      <form onSubmit={handleSend} style={{ maxWidth: '500px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>To:</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            required
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              backgroundColor: '#222',
              border: '1px solid #444',
              color: '#fff',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Test email subject"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              backgroundColor: '#222',
              border: '1px solid #444',
              color: '#fff',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Body:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your email content here..."
            rows={6}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              backgroundColor: '#222',
              border: '1px solid #444',
              color: '#fff',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: status === 'sending' ? '#444' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer'
          }}
        >
          {status === 'sending' ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: status === 'success' ? '#1b4332' : '#5c1a1a',
          maxWidth: '500px'
        }}>
          {message}
        </div>
      )}

      <p style={{ marginTop: '40px', color: '#666', fontSize: '12px' }}>
        From: fun@fdft.com (via Gmail OAuth)
      </p>
    </div>
  );
}
