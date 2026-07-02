import React, { useEffect, useRef, useState } from 'react';

export default function GoogleAuthButton({ onSuccess, onError, label = 'Continue with Google' }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadScript = () => {
      if (window.google?.accounts?.id) {
        renderButton();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderButton;
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    const renderButton = () => {
      if (!window.google?.accounts?.id || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: async (response) => {
          try {
            await onSuccess(response.credential);
          } catch (error) {
            onError?.(error);
          }
        },
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 320,
      });

      setReady(true);
    };

    loadScript();
  }, [onError, onSuccess]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <div className="rounded-full border border-dashed border-neutral-300 bg-neutral-100 px-4 py-3 text-center text-sm text-neutral-600">
        Google sign-in is ready once VITE_GOOGLE_CLIENT_ID is configured.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className="min-h-[44px]" />
      {!ready && <p className="text-sm text-neutral-500">Loading Google sign-in…</p>}
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
