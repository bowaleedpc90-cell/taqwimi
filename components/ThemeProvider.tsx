'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'taqwimi.theme';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

/**
 * يدير السمة (فاتح/داكن) عبر data-theme على <html>. القيمة الأولى يضبطها سكربت مضمّن
 * في layout قبل الرسم (منع الوميض)، ويحفظ الاختيار في localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // لون شريط المتصفح يتبع السمة الفعلية (يتجاوز الوسمين المبنيين على تفضيل النظام)
  const applyMeta = (t: Theme) => {
    let m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-managed]');
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute('name', 'theme-color');
      m.setAttribute('data-managed', '');
      document.head.appendChild(m);
    }
    m.setAttribute('content', t === 'dark' ? '#0d1117' : '#0B2A4A');
  };

  // بعد mount: اقرأ ما ضبطه السكربت المضمّن لمواءمة حالة React (الافتراضي فاتح)
  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme | undefined) ?? 'light';
    setThemeState(current);
    applyMeta(current);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    applyMeta(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* وضع خاص/ممتلئ — نتجاهل */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return <Ctx.Provider value={{ theme, toggle, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTheme لازم يُستخدم داخل ThemeProvider');
  return c;
}
