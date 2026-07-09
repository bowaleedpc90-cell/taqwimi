'use client';

export function GeneralNote({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <section className="card mt-3 p-3">
      <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-heading">
        <span aria-hidden>📌</span>
        ملاحظات عامة على الشهر
      </label>
      <textarea
        className="field general-note min-h-[90px] resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب ملاحظاتك هنا — ستظهر وتُطبع أسفل رزنامة هذا الشهر…"
      />
    </section>
  );
}
