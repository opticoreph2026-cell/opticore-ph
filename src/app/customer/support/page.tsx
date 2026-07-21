'use client';

import React, { useState } from 'react';

export default function CustomerSupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('success');
      setSubject('');
      setMessage('');
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground-950 mb-2">Support</h1>
        <p className="text-foreground-400">Get help with your solar system or account.</p>
      </div>

      {status === 'success' && (
        <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-sm">
          Your message has been sent. We&apos;ll respond within 24 hours.
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">
          Failed to send. Please try again or email us directly at opticoreph2026@gmail.com.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-background-800 border border-foreground-950/5 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground-300 mb-1.5">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              className="w-full bg-background-900 border border-foreground-950/5 rounded-lg px-3 py-2 text-sm text-foreground-950 placeholder:text-foreground-950/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-300 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Describe your concern in detail..."
              className="w-full bg-background-900 border border-foreground-950/5 rounded-lg px-3 py-2 text-sm text-foreground-950 placeholder:text-foreground-950/40 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending || !subject.trim() || !message.trim()}
            className="px-6 py-2.5 rounded-xl bg-accent-cyan text-background-950 text-sm font-semibold hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
}
