import { pad2 } from '@/lib/dateUtils';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * خلفية مائية خفيفة جدًا لشهر معيّن — تُوضع داخل حاوية `relative overflow-hidden`.
 * الشفافية منخفضة جدًا (افتراضي 0.1) + خفض تشبّع بسيط لتوحيد الصور النهارية/الليلية،
 * بحيث تبقى الأرقام والعطل والنوتات فوقها واضحة تمامًا. القراءة أهم من الصورة.
 * eager=true للطباعة (خصوصًا السنة كاملة) كي تُحمّل كل الصفحات قبل window.print()
 * حتى على Safari/iOS الذي لا يجبر تحميل صور lazy خارج الشاشة قبل الطباعة.
 */
export function MonthWatermark({
  month,
  opacity = 0.1,
  eager = false,
}: {
  month: number;
  opacity?: number;
  eager?: boolean;
}) {
  return (
    <img
      src={`${base}/monthly-art/${pad2(month)}.jpg`}
      alt=""
      aria-hidden
      loading={eager ? 'eager' : 'lazy'}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-cover"
      style={{ opacity, filter: 'saturate(0.8)' }}
    />
  );
}
