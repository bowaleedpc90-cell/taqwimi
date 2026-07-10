'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { translate } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

const STORAGE_KEY = 'taqwimi.lang';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** ترجمة نص عربي (المفتاح) مع استيفاء اختياري {name}. */
  t: (key: string, params?: Record<string, string | number>) => string;
}

const Ctx = createContext<LangCtx | null>(null);

/**
 * تدير لغة الواجهة عبر lang/dir على <html>. القيمة الأولى يضبطها سكربت مضمّن في
 * layout قبل الرسم (منع الوميض/الانقلاب)، ويُحفظ الاختيار في localStorage.
 * العربية RTL (الأساسية)، الإنجليزية LTR.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  // بعد mount: اقرأ ما ضبطه السكربت المضمّن لمواءمة حالة React
  useEffect(() => {
    setLangState(document.documentElement.lang === 'en' ? 'en' : 'ar');
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'en' ? 'ltr' : 'rtl';
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* وضع خاص/ممتلئ — نتجاهل */
    }
  }, []);

  const toggle = useCallback(() => setLang(lang === 'ar' ? 'en' : 'ar'), [lang, setLang]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang, toggle, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLang لازم يُستخدم داخل LanguageProvider');
  return c;
}

/** اختصار للحصول على دالة الترجمة فقط. */
export function useT(): LangCtx['t'] {
  return useLang().t;
}
