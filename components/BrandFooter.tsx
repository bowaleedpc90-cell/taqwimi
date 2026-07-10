'use client';

import { useT } from './LanguageProvider';

const INSTAGRAM_URL = 'https://www.instagram.com/xstar.kw/';
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

function InstagramGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BrandFooter({ className = '' }: { className?: string }) {
  const t = useT();
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('X Star Software على إنستغرام')}
      className={`no-print mt-4 flex items-center gap-3 rounded-xl2 border border-line bg-surface px-4 py-3 shadow-card transition hover:border-heading/30 active:scale-[0.99] ${className}`}
    >
      <img
        src={`${base}/xstar-logo.svg`}
        alt="X Star Software"
        width={38}
        height={38}
        className="shrink-0 rounded-xl"
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[11px] text-muted">{t('تطوير وبرمجة')}</span>
        <span className="truncate text-sm font-extrabold text-heading">X Star Software</span>
      </span>
      <span className="ms-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2176FF]/10 text-[#2176FF]">
        <InstagramGlyph />
      </span>
    </a>
  );
}
