'use client';

import { useApp } from './AppStateProvider';

export function StorageBanner() {
  const { storageOk, hydrated } = useApp();
  if (!hydrated || storageOk) return null;
  return (
    <div className="no-print bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700">
      التخزين غير متاح — لن تُحفظ تغييراتك. جرّب إيقاف وضع التصفّح الخاص أو أفرغ مساحة.
    </div>
  );
}
