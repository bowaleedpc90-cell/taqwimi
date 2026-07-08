'use client';

import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { StorageBanner } from './StorageBanner';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell mx-auto flex min-h-[100dvh] max-w-md flex-col bg-canvas">
      <StorageBanner />
      <main className="app-main flex-1 px-3 pb-28 pt-3">{children}</main>
      <BottomNav />
    </div>
  );
}
