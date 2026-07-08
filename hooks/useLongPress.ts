'use client';

import { useCallback, useRef } from 'react';

/**
 * ضغط مطوّل (لمس + فأرة) لفتح تعديل عطلة اليوم. يتجاهل السحب/التمرير (> 10px)،
 * ويضبط `longFired` لكبت نقرة الـ click التي تلي الضغط المطوّل مباشرة.
 */
export function useLongPress(onLongPress: () => void, delay = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longFired = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    startPos.current = null;
  }, []);

  const start = useCallback(
    (x: number, y: number) => {
      longFired.current = false;
      startPos.current = { x, y };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        longFired.current = true;
        onLongPress();
      }, delay);
    },
    [onLongPress, delay],
  );

  const move = useCallback(
    (x: number, y: number) => {
      if (!startPos.current) return;
      if (Math.abs(x - startPos.current.x) > 10 || Math.abs(y - startPos.current.y) > 10) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
      }
    },
    [],
  );

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => start(e.touches[0].clientX, e.touches[0].clientY),
    onTouchMove: (e: React.TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: clear,
    onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
    onMouseMove: (e: React.MouseEvent) => move(e.clientX, e.clientY),
    onMouseUp: clear,
    onMouseLeave: clear,
  };

  return { longFired, handlers };
}
