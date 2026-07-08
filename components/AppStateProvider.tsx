'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useAppState, type UseAppState } from '@/hooks/useAppState';

const Ctx = createContext<UseAppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const value = useAppState();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): UseAppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp لازم يُستخدم داخل AppStateProvider');
  return ctx;
}
