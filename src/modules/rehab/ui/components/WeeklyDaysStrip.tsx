"use client";

import { formatDateIsoCalendar } from "@/modules/rehab/domain/protocolSchedule";
import type { WeeklyDayPoint } from "@/modules/rehab/domain/RehabPlan";

const WEEKDAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"];

export function WeeklyDaysStrip({
  days,
  selectedDate,
  todayIso,
  onSelectDate,
  className = "",
}: {
  days: WeeklyDayPoint[];
  selectedDate: string;
  todayIso: string;
  onSelectDate: (date: string) => void;
  className?: string;
}) {
  if (days.length === 0) return null;

  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 ${className}`.trim()}>
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
        const dayNumber = formatDateIsoCalendar(day.date, { day: "numeric" });
        const dotColor =
          status === "done"
            ? "bg-success"
            : status === "missed"
              ? "bg-error"
              : isToday
                ? "bg-primary"
                : "bg-border";

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={`flex min-w-[52px] flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition-all active:scale-95 ${
              isSelected
                ? "border-primary bg-primary/10 ring-2 ring-primary/15"
                : status === "done"
                  ? "border-success/40 bg-success/5"
                  : status === "missed"
                    ? "border-error/40 bg-error/5"
                    : "border-border bg-surface-1"
            }`}
            title={`${formatDateIsoCalendar(day.date, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}${isRest ? " · sin ejercicios agendados" : ` · ${day.completed}/${day.due} completados`}`}
          >
            <span
              className={`font-label text-label-md ${
                isSelected ? "text-primary" : "text-text-3"
              }`}
            >
              {WEEKDAY_LETTERS[index]}
            </span>
            <span
              className={`font-metric text-metric-sm ${
                isSelected ? "text-primary" : "text-text-1"
              }`}
            >
              {dayNumber}
            </span>
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          </button>
        );
      })}
    </div>
  );
}
