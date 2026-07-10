'use client';

import { useT } from './LanguageProvider';

export function GeneralNote({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useT();
  return (
    <section className="card mt-3 p-3">
      <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-heading">
        <span aria-hidden>📌</span>
        {t('ملاحظات عامة على الشهر')}
      </label>
      <textarea
        className="field general-note min-h-[90px] resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('اكتب ملاحظاتك هنا — ستظهر وتُطبع أسفل رزنامة هذا الشهر…')}
      />
    </section>
  );
}
