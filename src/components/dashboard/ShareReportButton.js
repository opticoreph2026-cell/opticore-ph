'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareReportButton({ reportId, isBusiness }) {
  const [copied, setCopied] = useState(false);

  if (!isBusiness) return null;

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/p/${reportId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`btn-ghost text-xs px-3 py-2 shrink-0 flex items-center gap-1.5 transition-colors ${copied ? 'text-emerald-400 hover:text-emerald-300' : 'hover:text-brand-400'}`}
      title="Share Public Link"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
