'use client';

import { useEffect, useState } from 'react';
import { todayInKuwait } from '@/lib/dateUtils';

/**
 * «اليوم» بتوقيت الكويت — يرجع '' حتى بعد mount أول رسم (تجنّب hydration mismatch)،
 * ثم يُحدَّث فعليًا على العميل. يُعاد الحساب عند عودة التركيز/الظهور (مرور منتصف الليل).
 */
export function useToday(): string {
  const [today, setToday] = useState('');

  useEffect(() => {
    const update = () => setToday(todayInKuwait());
    update();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return today;
}
