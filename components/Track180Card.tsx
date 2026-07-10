'use client';

import { useMemo } from 'react';
import { computeTrack180, type Track180Stats } from '@/lib/track180';
import { useT } from './LanguageProvider';
import { useApp } from './AppStateProvider';

type TFn = ReturnType<typeof useT>;

// ألوان الحالة من توكنز السمة — تنقلب تلقائيًا بين الفاتح والداكن
const STATUS_META = {
  safe: { label: 'وضعك آمن', emoji: '✅', text: 'text-national', tint: 'bg-national-soft text-national' },
  warning: { label: 'انتبه', emoji: '⚠️', text: 'text-religious', tint: 'bg-religious-soft text-religious' },
  danger: { label: 'خطر على الهدف', emoji: '🔴', text: 'text-danger', tint: 'bg-danger-soft text-danger' },
} as const;

function statusHint(s: Track180Stats, t: TFn): string {
  if (s.achieved) return t('أكملت أيام العمل المطلوبة لاستحقاق الأعمال الممتازة.');
  if (!s.reachable) return t('بالوتيرة الحالية قد لا تصل إلى الهدف — راجع إجازاتك القادمة.');
  if (s.status === 'safe') return t('لديك هامش أمان تقديري {n} يوم عمل قبل التأثير على الهدف.', { n: s.safetyBuffer });
  if (s.status === 'warning') return t('هامش الأمان {n} يوم عمل فقط — راجع إجازاتك القادمة.', { n: s.safetyBuffer });
  return t('هامش الأمان منخفض جدًا ({n} يوم عمل) — أي إجازة إضافية قد تؤثر على الهدف.', { n: s.safetyBuffer });
}

const RING_R = 48;
const RING_C = 2 * Math.PI * RING_R;

export function Track180Card({ today, onOpenRange }: { today: string; onOpenRange: () => void }) {
  const { state } = useApp();
  const t = useT();
  const stats = useMemo(() => computeTrack180(state, today), [state, today]);

  const meta = stats.achieved ? { ...STATUS_META.safe, label: 'مبروك! حققت الهدف', emoji: '🎉' } : STATUS_META[stats.status];
  const frac = Math.min(1, stats.completedDays / stats.targetDays);

  return (
    <section className="no-print card mt-3 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-heading">
        <span aria-hidden>🎯</span>
        {t('تتبع ١٨٠ يوم')}
        <span className="num ms-auto text-xs font-semibold text-muted">{stats.year}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* دائرة التقدم */}
        <div className="relative h-28 w-28 shrink-0" role="img" aria-label={t('أنجزت {done} من {target} يوم عمل', { done: stats.completedDays, target: stats.targetDays })}>
          <svg viewBox="0 0 112 112" className="h-full w-full">
            <circle cx="56" cy="56" r={RING_R} fill="none" strokeWidth="10" stroke="currentColor" className="text-line" />
            <circle
              cx="56"
              cy="56"
              r={RING_R}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="currentColor"
              className={meta.text}
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - frac)}
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="num text-2xl font-extrabold leading-none text-heading">{stats.completedDays}</span>
            <span className="mt-1 text-[10px] font-semibold text-muted">{t('من ١٨٠ يوم')}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${meta.tint}`}>
            <span aria-hidden>{meta.emoji}</span>
            {t(meta.label)}
            <span className="num">{stats.percent}%</span>
          </span>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">{statusHint(stats, t)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-line bg-canvas px-1 py-2">
          <div className="num text-lg font-extrabold text-heading">{stats.availableWorkDays}</div>
          <div className="text-[10px] font-semibold leading-tight text-muted">{t('متاح حتى نهاية السنة')}</div>
        </div>
        <div className="rounded-xl border border-line bg-canvas px-1 py-2">
          <div className="num text-lg font-extrabold text-heading">{stats.remainingToTarget}</div>
          <div className="text-[10px] font-semibold leading-tight text-muted">{t('متبقٍ للهدف')}</div>
        </div>
        <div className="rounded-xl border border-line bg-canvas px-1 py-2">
          <div className={`num text-lg font-extrabold ${meta.text}`}>{stats.safetyBuffer}</div>
          <div className="text-[10px] font-semibold leading-tight text-muted">{t('رصيد الأمان')}</div>
        </div>
      </div>

      <button type="button" onClick={onOpenRange} className="btn btn-ghost mt-3 w-full text-sm">
        <span aria-hidden>＋</span> {t('تسجيل إجازة لعدة أيام')}
      </button>

      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {t('الأيام بلا حالة تُحسب دوامًا تلقائيًا — سجّل إجازة يوم بالضغط عليه، أو فترة كاملة من الزر أعلاه. حساب إرشادي وليس مستندًا رسميًا.')}
      </p>
    </section>
  );
}
