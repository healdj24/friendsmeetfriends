'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  // Test email state
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Batch email state
  const [batchSubject, setBatchSubject] = useState('');
  const [batchBody, setBatchBody] = useState('');
  const [batchStatus, setBatchStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [batchMessage, setBatchMessage] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load subscriber count on mount
  useEffect(() => {
    fetch('/api/subscribers')
      .then(res => res.json())
      .then(data => {
        if (data.count !== undefined) {
          setSubscriberCount(data.count);
        }
      })
      .catch(() => setSubscriberCount(null));
  }, []);

  // Send test email
  const handleTestSend = async (e: React.FormEvent) => {
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
      setTo('');
      setSubject('');
      setBody('');
    } catch (err) {
      setStatus('error');
      setMessage('Network error');
    }
  };

  // Send batch email to all subscribers
  const handleBatchSend = async () => {
    setBatchStatus('sending');
    setBatchMessage('');
    setShowConfirm(false);

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: batchSubject, body: batchBody }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBatchStatus('error');
        setBatchMessage(data.error || 'Failed to send');
        return;
      }

      setBatchStatus('success');
      setBatchMessage(`Sent to ${data.count} subscribers! ${data.failed > 0 ? `(${data.failed} failed)` : ''}`);
      setBatchSubject('');
      setBatchBody('');
    } catch (err) {
      setBatchStatus('error');
      setBatchMessage('Network error');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#222',
    border: '1px solid #444',
    color: '#fff',
    borderRadius: '4px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      padding: '40px',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ marginBottom: '10px' }}>FDFT Admin</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        From: fun@fdft.net (via Gmail OAuth)
      </p>

      <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
        {/* Test Email Section */}
        <div style={{ maxWidth: '450px', flex: 1 }}>
          <h2 style={{ marginBottom: '20px', color: '#4CAF50' }}>Send Test Email</h2>
          <form onSubmit={handleTestSend}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>To:</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Test email subject"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Body:</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Your email content here..."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
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
              marginTop: '15px',
              padding: '12px',
              borderRadius: '4px',
              backgroundColor: status === 'success' ? '#1b4332' : '#5c1a1a',
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Batch Email Section */}
        <div style={{ maxWidth: '450px', flex: 1 }}>
          <h2 style={{ marginBottom: '20px', color: '#f59e0b' }}>
            Send to All Subscribers
            {subscriberCount !== null && (
              <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>
                ({subscriberCount} subscribers)
              </span>
            )}
          </h2>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Subject:</label>
            <input
              type="text"
              value={batchSubject}
              onChange={(e) => setBatchSubject(e.target.value)}
              placeholder="Newsletter subject"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Body:</label>
            <textarea
              value={batchBody}
              onChange={(e) => setBatchBody(e.target.value)}
              placeholder="Your newsletter content..."
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!batchSubject || !batchBody || batchStatus === 'sending'}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: (!batchSubject || !batchBody) ? '#444' : '#f59e0b',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: (!batchSubject || !batchBody) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              Send to All Subscribers
            </button>
          ) : (
            <div style={{
              padding: '15px',
              backgroundColor: '#3d2608',
              borderRadius: '4px',
              border: '1px solid #f59e0b',
            }}>
              <p style={{ marginBottom: '10px' }}>
                Send to {subscriberCount} subscribers?
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleBatchSend}
                  disabled={batchStatus === 'sending'}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: batchStatus === 'sending' ? '#444' : '#f59e0b',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: batchStatus === 'sending' ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {batchStatus === 'sending' ? 'Sending...' : 'Yes, Send'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={batchStatus === 'sending'}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {batchMessage && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              borderRadius: '4px',
              backgroundColor: batchStatus === 'success' ? '#1b4332' : '#5c1a1a',
            }}>
              {batchMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
