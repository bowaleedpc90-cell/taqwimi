'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function normalize(path: string): string {
  if (!path) return '/';
  const p = path.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

const TABS = [
  { href: '/', label: 'الرزنامة', match: (p: string) => p === '/' || p === '/year', icon: CalendarIcon },
  { href: '/additions', label: 'إضافاتي', match: (p: string) => p === '/additions', icon: ListIcon },
  { href: '/print', label: 'الطباعة', match: (p: string) => p === '/print', icon: PrintIcon },
  { href: '/settings', label: 'الإعدادات', match: (p: string) => p === '/settings', icon: GearIcon },
];

export function BottomNav() {
  const pathname = normalize(usePathname());

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition ${
                active ? 'text-heading' : 'text-muted'
              }`}
              style={{ minHeight: 60 }}
            >
              <Icon active={active} />
              <span>{tab.label}</span>
              <span
                className={`h-1 w-6 rounded-full transition ${active ? 'bg-gold' : 'bg-transparent'}`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ----------------------------- الأيقونات ----------------------------- */

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
    </svg>
  );
}

function PrintIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="2" />
      <rect x="7" y="15" width="10" height="6" rx="1" />
    </svg>
  );
}

function GearIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </svg>
  );
}
