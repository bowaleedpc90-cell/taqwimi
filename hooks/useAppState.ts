'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultState, loadState, saveState } from '@/lib/storage';
import type { AppState } from '@/lib/types';

export interface UseAppState {
  state: AppState;
  hydrated: boolean;
  storageOk: boolean;
  update: (updater: (prev: AppState) => AppState) => void;
}

export function useAppState(): UseAppState {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const skipNextSave = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // hydration من localStorage بعد mount فقط
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // حفظ تلقائي مؤجّل (~300ms)، مع تخطّي أول حفظ بعد hydration
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStorageOk(saveState(state));
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, hydrated]);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  }, []);

  return { state, hydrated, storageOk, update };
}
