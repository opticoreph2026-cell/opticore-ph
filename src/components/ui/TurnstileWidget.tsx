'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
      }) => string | undefined;
      remove: (widgetId: string) => void;
    };
    __cfTurnstileQueue?: Array<() => void>;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError: () => void;
  onExpire: () => void;
}

const SCRIPT_ID = '__cf_turnstile_script';

export function TurnstileWidget({ siteKey, onSuccess, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>();

  useEffect(() => {
    const renderWidget = () => {
      if (containerRef.current && window.turnstile) {
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onSuccess,
          'error-callback': onError,
          'expired-callback': onExpire,
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    if (!window.__cfTurnstileQueue) {
      window.__cfTurnstileQueue = [];
    }
    window.__cfTurnstileQueue.push(renderWidget);

    if (!document.getElementById(SCRIPT_ID)) {
      (window as any).cfTurnstileOnLoad = () => {
        const q = window.__cfTurnstileQueue || [];
        window.__cfTurnstileQueue = [];
        q.forEach((fn) => fn());
      };
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=cfTurnstileOnLoad';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch {}
      }
    };
  }, []);

  return <div ref={containerRef} data-action="turnstile-spin-v2" />;
}
