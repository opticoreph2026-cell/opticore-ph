'use client';

import { useEffect, useRef } from 'react';

// Using Cloudflare Turnstile's dummy test key that always passes.
// In production, swap with process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export default function Captcha({ onVerify }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const scriptId = 'turnstile-script';
    let timeoutId;
    let retryCount = 0;
    const maxRetries = 10;

    const initTurnstile = () => {
      if (window.turnstile && containerRef.current) {
        // Clear previous content just in case
        containerRef.current.innerHTML = '';
        try {
          window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            theme: 'dark',
            callback: (token) => {
              if (onVerify) onVerify(token);
            },
          });
        } catch (e) {
          console.warn('Turnstile render failed:', e);
        }
      } else if (retryCount < maxRetries) {
        // Retry if window.turnstile is not yet available but script is present
        retryCount++;
        timeoutId = setTimeout(initTurnstile, 500);
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = initTurnstile;
      document.head.appendChild(script);
    } else {
      // Small delay to ensure the existing script has executed
      timeoutId = setTimeout(initTurnstile, 100);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      const current = containerRef.current;
      if (current) {
        current.innerHTML = '';
      }
    };
  }, [onVerify]);

  return (
    <div className="flex flex-col items-center gap-3 my-6 animate-fade-in">
      <div 
        ref={containerRef} 
        className="turnstile-container min-h-[65px] flex items-center justify-center p-2 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-xl"
      />
      {!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Secured by Cloudflare Turnstile
        </p>
      )}
    </div>
  );
}
