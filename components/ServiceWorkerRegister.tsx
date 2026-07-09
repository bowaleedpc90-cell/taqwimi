'use client';

import { useEffect } from 'react';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** يسجّل Service Worker (في الإنتاج فقط) لتمكين العمل دون اتصال. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {
        /* تجاهل — التطبيق يعمل بدونه */
      });
    };
    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
