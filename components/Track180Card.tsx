'use client';

import { useMemo } from 'react';
import { computeTrack180, type Track180Stats } from '@/lib/track180';
import { useApp } from './AppStateProvider';

// ألوان الحالة من توكنز السمة — تنقلب تلقائيًا بين الفاتح والداكن
const STATUS_META = {
  safe: { label: 'وضعك آمن', emoji: '✅', text: 'text-national', tint: 'bg-national-soft text-national' },
  warning: { label: 'انتبه', emoji: '⚠️', text: 'text-religious', tint: 'bg-religious-soft text-religious' },
  danger: { label: 'خطر على الهدف', emoji: '🔴', text: 'text-danger', tint: 'bg-danger-soft text-danger' },
} as const;

function statusHint(s: Track180Stats): string {
  if (s.achieved) return 'أكملت أيام العمل المطلوبة لاستحقاق الأعمال الممتازة.';
  if (!s.reachable) return 'بالوتيرة الحالية قد لا تصل إلى الهدف — راجع إجازاتك القادمة.';
  if (s.status === 'safe') return `لديك هامش أمان تقديري ${s.safetyBuffer} يوم عمل قبل التأثير على الهدف.`;
  if (s.status === 'warning') return `هامش الأمان ${s.safetyBuffer} يوم عمل فقط — راجع إجازاتك القادمة.`;
  return `هامش الأمان منخفض جدًا (${s.safetyBuffer} يوم عمل) — أي إجازة إضافية قد تؤثر على الهدف.`;
}

const RING_R = 48;
const RING_C = 2 * Math.PI * RING_R;

export function Track180Card({ today }: { today: string }) {
  const { state } = useApp();
  const stats = useMemo(() => computeTrack180(state, today), [state, today]);

  const meta = stats.achieved ? { ...STATUS_META.safe, label: 'مبروك! حققت الهدف', emoji: '🎉' } : STATUS_META[stats.status];
  const frac = Math.min(1, stats.completedDays / stats.targetDays);

  return (
    <section className="no-print card mt-3 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-heading">
        <span aria-hidden>🎯</span>
        تتبع ١٨٠ يوم
        <span className="num ms-auto text-xs font-semibold text-muted">{stats.year}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* دائرة التقدم */}
        <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`أنجزت ${stats.completedDays} من ${stats.targetDays} يوم عمل`}>
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
            <span className="mt-1 text-[10px] font-semibold text-muted">من ١٨٠ يوم</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${meta.tint}`}>
            <span aria-hidden>{meta.emoji}</span>
            {meta.label}
            <span className="num">{stats.percent}%</span>
          </span>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">{statusHint(stats)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-line bg-canvas px-1 py-2">
          <div className="num text-lg font-extrabold text-heading">{stats.availableWorkDays}</div>
          <div className="text-[10px] font-semibold leading-tight text-muted">متاح حتى نهاية السنة</div>
        </div>
        <div className="rounded-xl border border-line bg-canvas px-1 py-2">
          <div className="num text-lg font-extrabold text-heading">{stats.remainingToTarget}</div>
          <div className="text-[10px] font-semibold leading-tight text-muted">متبقٍ للهدف</div>
        </div>
        <div className="rounded-xl border border-line bg-canvas px-1 py-2">
          <div className={`num text-lg font-extrabold ${meta.text}`}>{stats.safetyBuffer}</div>
          <div className="text-[10px] font-semibold leading-tight text-muted">رصيد الأمان</div>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        الأيام بلا حالة تُحسب دوامًا تلقائيًا — سجّل إجازاتك بالضغط على اليوم. حساب إرشادي وليس مستندًا رسميًا.
      </p>
    </section>
  );
}
