'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildMonthGrid } from '@/lib/calendarEngine';
import { formatMonthTitle, monthKey, parseYMD, shiftMonth } from '@/lib/dateUtils';
import { hijriMonthLabel } from '@/lib/hijriUtils';
import { effectiveHolidayMap } from '@/lib/kuwaitHolidayService';
import type { Holiday, Settings } from '@/lib/types';
import { useApp } from './AppStateProvider';
import { useToday } from '@/hooks/useToday';
import { useSwipe } from '@/hooks/useSwipe';
import { MonthNav } from './MonthNav';
import { CalendarGrid } from './CalendarGrid';
import { GeneralNote } from './GeneralNote';
import { DaySheet } from './DaySheet';
import type { CellVM } from './DayCell';
import { ViewToggle } from './ViewToggle';
import { BrandFooter } from './BrandFooter';
import { HolidayEditSheets, builtinEditingFor, type HolidayEditing } from './HolidayEditSheets';

function visibleHoliday(h: Holiday | undefined, settings: Settings): Holiday | undefined {
  if (!h) return undefined;
  if (h.type === 'custom') return h;
  if (h.isEstimated) return settings.showReligious ? h : undefined;
  return settings.showHolidays ? h : undefined;
}

export function CalendarShell() {
  const { state, hydrated, update } = useApp();
  const today = useToday();
  const [ym, setYm] = useState<{ y: number; m: number } | null>(null);
  const [sheetDate, setSheetDate] = useState<string | null>(null);
  const [holidayEdit, setHolidayEdit] = useState<HolidayEditing>(null);

  // تهيئة: أولوية لمعاملات الرابط (?y&m من عرض السنة)، وإلا الشهر الحالي بتوقيت الكويت
  useEffect(() => {
    if (ym) return;
    const params = new URLSearchParams(window.location.search);
    const qy = Number(params.get('y'));
    const qm = Number(params.get('m'));
    if (qy >= 1970 && qm >= 1 && qm <= 12) {
      setYm({ y: qy, m: qm });
      return;
    }
    if (today) setYm(parseYMD(today));
  }, [today, ym]);

  const swipe = useSwipe({
    onSwipeLeft: () => setYm((p) => (p ? shiftMonth(p.y, p.m, 1) : p)),
    onSwipeRight: () => setYm((p) => (p ? shiftMonth(p.y, p.m, -1) : p)),
  });

  const view = useMemo(() => {
    if (!ym) return null;
    const grid = buildMonthGrid({
      year: ym.y,
      month: ym.m,
      weekStart: state.settings.weekStart,
      weekendDows: state.settings.weekendDows,
      todayISO: today,
    });
    const hmap = effectiveHolidayMap(ym.y, state);
    const itemsByDate: Record<string, typeof state.items> = {};
    for (const it of state.items) (itemsByDate[it.date] ||= []).push(it);

    const cells: CellVM[] = grid.cells.map((cell) => ({
      cell,
      holiday: cell.iso ? visibleHoliday(hmap.get(cell.iso), state.settings) : undefined,
      items: cell.iso ? itemsByDate[cell.iso] ?? [] : [],
      hasNote: !!(cell.iso && state.settings.showNotes && state.dayNotes[cell.iso]),
    }));

    const weekendCols = grid.weekdayLabels.map((_, i) =>
      state.settings.weekendDows.includes((state.settings.weekStart + i) % 7),
    );

    return { grid, cells, weekendCols };
  }, [ym, state, today]);

  if (!hydrated || !ym || !view) {
    return (
      <div className="animate-pulse">
        <div className="mx-auto mb-3 h-8 w-40 rounded-full bg-navy-50" />
        <div className="h-[420px] rounded-xl2 bg-navy-50/60" />
      </div>
    );
  }

  const mk = monthKey(ym.y, ym.m);

  // ضغط مطوّل على يوم: تعديل عطلته إن وُجدت، وإلا إضافة عطلة/مناسبة على تاريخه
  function onLongPressDay(iso: string) {
    const yr = Number(iso.slice(0, 4));
    const h = effectiveHolidayMap(yr, state).get(iso);
    if (h?.isCustom && h.id) {
      setHolidayEdit({ mode: 'custom', id: h.id, value: { nameAr: h.nameAr, gregorianDate: h.gregorianDate, type: h.type } });
    } else if (h?.slug) {
      setHolidayEdit(builtinEditingFor(yr, h.slug, state));
    } else {
      setHolidayEdit({ mode: 'add', date: iso });
    }
  }

  return (
    <div>
      <ViewToggle active="month" />

      <div {...swipe}>
        <MonthNav
          title={formatMonthTitle(ym.y, ym.m)}
          hijri={hijriMonthLabel(ym.y, ym.m)}
          onPrev={() => setYm(shiftMonth(ym.y, ym.m, -1))}
          onNext={() => setYm(shiftMonth(ym.y, ym.m, 1))}
          onToday={() => today && setYm(parseYMD(today))}
        />
        <CalendarGrid
          month={ym.m}
          weekdayLabels={view.grid.weekdayLabelsShort}
          cells={view.cells}
          weekendCols={view.weekendCols}
          onSelectDay={setSheetDate}
          onLongPressDay={onLongPressDay}
        />
      </div>

      {state.settings.showNotes && (
        <GeneralNote
          value={state.generalNotes[mk] ?? ''}
          onChange={(v) =>
            update((s) => {
              const next = { ...s.generalNotes };
              if (v.trim() === '') delete next[mk];
              else next[mk] = v;
              return { ...s, generalNotes: next };
            })
          }
        />
      )}

      <Legend />

      <BrandFooter />

      {sheetDate && <DaySheet iso={sheetDate} onClose={() => setSheetDate(null)} />}

      <HolidayEditSheets year={ym.y} editing={holidayEdit} onClose={() => setHolidayEdit(null)} />
    </div>
  );
}

function Legend() {
  const items = [
    { c: 'bg-national', l: 'عطلة وطنية' },
    { c: 'bg-religious', l: 'مناسبة دينية' },
    { c: 'bg-weekend border border-line', l: 'نهاية الأسبوع' },
    { c: 'bg-gold', l: 'يوجد نوتة' },
  ];
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-2 text-xs text-muted">
      {items.map((it) => (
        <span key={it.l} className="inline-flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${it.c}`} />
          {it.l}
        </span>
      ))}
    </div>
  );
}
