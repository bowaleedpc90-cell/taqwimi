'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { useT } from './LanguageProvider';

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  );
}

/** زر تبديل الوضع الليلي/النهاري. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const t = useT();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t('التبديل إلى الوضع النهاري') : t('التبديل إلى الوضع الليلي')}
      title={isDark ? t('الوضع النهاري') : t('الوضع الليلي')}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-subtle text-heading transition active:scale-95 ${className}`}
    >
      {/* قبل mount نعرض أيقونة محايدة لتجنّب عدم تطابق الترطيب */}
      {mounted ? (isDark ? <SunIcon /> : <MoonIcon />) : <MoonIcon />}
    </button>
  );
}
