'use client';

import { useEffect, useRef } from 'react';

// Using Cloudflare Turnstile's dummy test key that always passes.
// In production, swap with process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export default function Captcha({ onVerify }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Inject Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.onloadTurnstileCallback = () => {
      if (containerRef.current) {
        window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: (token) => {
            if (onVerify) onVerify(token);
          },
        });
      }
    };

    // Attach callback to window
    window.onloadTurnstileCallback = window.onloadTurnstileCallback;

    return () => {
      // Clean up script
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.onloadTurnstileCallback;
    };
  }, [onVerify]);

  return (
    <div className="flex justify-center my-4">
      <div 
        ref={containerRef} 
        className="turnstile-container"
      />
    </div>
  );
}
