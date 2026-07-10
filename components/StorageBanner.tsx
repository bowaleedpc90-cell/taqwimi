'use client';

import { useApp } from './AppStateProvider';
import { useT } from './LanguageProvider';

export function StorageBanner() {
  const { storageOk, hydrated } = useApp();
  const t = useT();
  if (!hydrated || storageOk) return null;
  return (
    <div className="no-print bg-danger-soft px-3 py-2 text-center text-sm font-semibold text-danger">
      {t('التخزين غير متاح — لن تُحفظ تغييراتك. جرّب إيقاف وضع التصفّح الخاص أو أفرغ مساحة.')}
    </div>
  );
}
