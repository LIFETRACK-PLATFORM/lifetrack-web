"use client";

import { Icon } from "@/shared/ui/Icon";
import type { WeeklyDayPoint } from "@/modules/rehab/domain/RehabPlan";

const WEEKDAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"];

export function WeeklyDaysStrip({
  days,
  selectedDate,
  todayIso,
  onSelectDate,
}: {
  days: WeeklyDayPoint[];
  selectedDate: string;
  todayIso: string;
  onSelectDate: (date: string) => void;
}) {
  if (days.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface-1 px-3 py-3">
      <div className="flex items-center justify-between">
        {days.map((day, index) => {
          const isToday = day.date === todayIso;
          const isSelected = day.date === selectedDate;
          const isRest = day.due === 0;
          const status = isRest
            ? "rest"
            : day.isFuture
              ? "future"
              : day.compliant
                ? "done"
                : "missed";

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className="flex flex-1 flex-col items-center gap-1.5"
              title={`${day.date}${isRest ? " · sin ejercicios agendados" : ` · ${day.completed}/${day.due} completados`}`}
            >
              <span className="font-label text-[11px] text-text-3">
                {WEEKDAY_LETTERS[index]}
              </span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] transition-transform active:scale-90 ${
                  status === "done"
                    ? "bg-success/20 text-success"
                    : status === "missed"
                      ? "bg-error/15 text-error"
                      : "bg-surface-3 text-text-3"
                } ${isToday ? "ring-2 ring-primary/40 ring-offset-1 ring-offset-surface-1" : ""} ${
                  isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-surface-1" : ""
                }`}
              >
                {status === "done" && (
                  <Icon name="check" className="text-[14px]" />
                )}
                {status === "missed" && (
                  <Icon name="close" className="text-[14px]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
