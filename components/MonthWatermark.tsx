import { pad2 } from '@/lib/dateUtils';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * خلفية مائية خفيفة جدًا لشهر معيّن — تُوضع داخل حاوية `relative overflow-hidden`.
 * الشفافية والمعالجة في CSS عبر صنف `.month-wm` (app/globals.css): خفيفة نهارًا (0.1)،
 * أخفت وأنعم ليلاً (0.06 + brightness)، وثابتة فاتحة عند الطباعة — بحيث تبقى الأرقام
 * والعطل والنوتات فوقها واضحة تمامًا في الوضعين. القراءة أهم من الصورة.
 * eager=true للطباعة (خصوصًا السنة كاملة) كي تُحمّل كل الصفحات قبل window.print()
 * حتى على Safari/iOS الذي لا يجبر تحميل صور lazy خارج الشاشة قبل الطباعة.
 */
export function MonthWatermark({ month, eager = false }: { month: number; eager?: boolean }) {
  return (
    <img
      src={`${base}/monthly-art/${pad2(month)}.jpg`}
      alt=""
      aria-hidden
      loading={eager ? 'eager' : 'lazy'}
      className="month-wm pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-cover"
    />
  );
}
