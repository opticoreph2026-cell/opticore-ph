'use client';
import { useEffect, useRef } from 'react';

/**
 * OptiCore PH - Cloudflare Turnstile CAPTCHA Component
 * 
 * Provides automated bot protection for Auth routes.
 * Uses explicit rendering to handle Next.js client-side navigation.
 */
export default function Captcha({ onVerify }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Inject Script if not present
    if (!document.getElementById('cloudflare-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cloudflare-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // 2. Render Function
    const renderWidget = () => {
      if (!isMounted) return;
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
            callback: (token) => {
              if (onVerify) onVerify(token);
            },
            theme: 'dark',
          });
        } catch (err) {
          console.warn('[Turnstile] Render failed, retrying...', err);
        }
      }
    };

    // 3. Script Loading Polling
    const checkTurnstile = setInterval(() => {
      if (window.turnstile) {
        renderWidget();
        clearInterval(checkTurnstile);
      }
    }, 500);

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(checkTurnstile);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
        widgetIdRef.current = null;
      }
    };
  }, [onVerify]);

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div 
        ref={containerRef} 
        className="min-h-[65px] transition-all duration-500 ease-in-out" 
        style={{ colorScheme: 'dark' }}
      />
      <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest opacity-50 font-mono">
        Secured by Cloudflare Turnstile
      </p>
    </div>
  );
}
