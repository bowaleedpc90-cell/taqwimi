'use client';

import { STORAGE_KEY } from '@/lib/constants';

// نحترم المسار الأساسي مثل بقية المكوّنات — '/' المكوَّد يكسر النشر تحت مسار فرعي.
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * حدّ خطأ لكل مسار: أي استثناء أثناء العرض يتحوّل إلى واجهة قابلة للتعافي
 * بدل إسقاط الشجرة كاملة. «مسح البيانات المحلية» مَخرج لمن تلفت بياناته
 * المخزّنة فيتعافى بنفسه دون أدوات المطوّر.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-3 text-4xl" aria-hidden>
        ⚠️
      </span>
      <h1 className="mb-2 text-lg font-extrabold text-heading">صار خطأ غير متوقّع</h1>
      <p className="mb-5 max-w-sm text-sm leading-relaxed text-muted">
        بياناتك محفوظة على جهازك ولم تُفقد. جرّب إعادة المحاولة — وإذا تكرّر الخطأ امسح البيانات
        المحلية للتطبيق.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <button type="button" onClick={reset} className="btn btn-primary w-full">
          إعادة المحاولة
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              window.localStorage.removeItem(STORAGE_KEY);
            } catch {
              /* تخزين غير متاح — نعيد التحميل على أي حال */
            }
            window.location.href = `${base}/`;
          }}
          className="btn btn-danger w-full"
        >
          مسح البيانات المحلية وإعادة التشغيل
        </button>
      </div>
    </div>
  );
}
