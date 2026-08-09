"use client";

import { Skeleton } from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import { formatWeekRangeLabel } from "@/modules/rehab/domain/protocolSchedule";
import type { WeeklyDayPoint } from "@/modules/rehab/domain/RehabPlan";
import { WeeklyDaysStrip } from "@/modules/rehab/ui/components/WeeklyDaysStrip";

export function WeeklyDaysNavigator({
  days,
  selectedDate,
  todayIso,
  weekStart,
  weekEnd,
  weeklyCompliancePercent,
  loadingWeek = false,
  canGoToNextWeek,
  isViewingCurrentWeek,
  onSelectDate,
  onPreviousWeek,
  onNextWeek,
  onGoToCurrentWeek,
  className = "",
}: {
  days: WeeklyDayPoint[];
  selectedDate: string;
  todayIso: string;
  weekStart?: string;
  weekEnd?: string;
  weeklyCompliancePercent: number;
  loadingWeek?: boolean;
  canGoToNextWeek: boolean;
  isViewingCurrentWeek: boolean;
  onSelectDate: (date: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onGoToCurrentWeek: () => void;
  className?: string;
}) {
  const weekLabel =
    weekStart && weekEnd
      ? formatWeekRangeLabel(weekStart, weekEnd)
      : "Semana seleccionada";

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Semana anterior"
          onClick={onPreviousWeek}
          disabled={loadingWeek}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-1 text-text-2 transition-all hover:border-primary/40 hover:text-primary active:scale-95 disabled:opacity-50"
        >
          <Icon name="chevron_left" className="text-[20px]" />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-label text-label-md font-semibold text-text-1">
            {weekLabel}
            <span className="font-normal text-text-3">
              {" "}
              · {weeklyCompliancePercent}% cumplimiento
            </span>
          </p>
          {!isViewingCurrentWeek && (
            <button
              type="button"
              onClick={onGoToCurrentWeek}
              disabled={loadingWeek}
              className="mt-0.5 font-label text-label-md text-primary underline-offset-2 hover:underline disabled:opacity-50"
            >
              Esta semana
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label="Semana siguiente"
          onClick={onNextWeek}
          disabled={loadingWeek || !canGoToNextWeek}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-1 text-text-2 transition-all hover:border-primary/40 hover:text-primary active:scale-95 disabled:opacity-50"
        >
          <Icon name="chevron_right" className="text-[20px]" />
        </button>
      </div>

      {loadingWeek ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-[72px] min-w-[52px] flex-1 rounded-xl" />
          ))}
        </div>
      ) : (
        <WeeklyDaysStrip
          days={days}
          selectedDate={selectedDate}
          todayIso={todayIso}
          onSelectDate={onSelectDate}
        />
      )}
    </div>
  );
}
