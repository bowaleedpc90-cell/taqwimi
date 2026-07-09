'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function ViewToggle({ active }: { active: 'month' | 'year' }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-xl font-extrabold text-heading">
        <span aria-hidden>🗓️</span>
        تقويمي
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-full bg-subtle p-1 text-sm font-bold">
          <Link
            href="/"
            className={`rounded-full px-4 py-1.5 transition ${
              active === 'month' ? 'bg-surface text-heading shadow-sm' : 'text-muted'
            }`}
          >
            شهري
          </Link>
          <Link
            href="/year"
            className={`rounded-full px-4 py-1.5 transition ${
              active === 'year' ? 'bg-surface text-heading shadow-sm' : 'text-muted'
            }`}
          >
            السنة
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
