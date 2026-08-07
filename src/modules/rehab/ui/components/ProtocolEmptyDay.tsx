"use client";

import {
  formatDateIsoCalendar,
  getExercisesDueOn,
} from "@/modules/rehab/domain/protocolSchedule";
import type { Exercise } from "@/modules/rehab/domain/Exercise";
import type { WeeklyDayPoint } from "@/modules/rehab/domain/RehabPlan";
import { Icon } from "@/shared/ui/Icon";

export function ProtocolEmptyDay({
  viewingDate,
  weeklyDays,
  exercises,
  onBorrowRoutine,
}: {
  viewingDate: string;
  weeklyDays: WeeklyDayPoint[];
  exercises: Exercise[];
  onBorrowRoutine: (sourceDate: string) => void;
}) {
  const sourceDays = weeklyDays.filter(
    (day) => day.due > 0 && day.date !== viewingDate && !day.isFuture,
  );

  const recentWithExercises = [...sourceDays]
    .reverse()
    .find((day) => getExercisesDueOn(exercises, day.date).length > 0);

  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-surface-1 px-4 py-6 text-center">
      <Icon name="event_busy" className="mx-auto mb-2 text-[28px] text-text-3" />
      <p className="text-body-md font-medium text-text-1">
        Sin ejercicios agendados este día
      </p>
      <p className="mt-1 text-body-md text-text-3">
        ¿Fue feriado o descanso pero igual hiciste la rutina? Puedes registrar la
        misma sesión de otro día sin crear ejercicios nuevos.
      </p>
      {recentWithExercises && (
        <button
          type="button"
          onClick={() => onBorrowRoutine(recentWithExercises.date)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95"
        >
          <Icon name="content_copy" className="text-[18px]" />
          Usar rutina del{" "}
          {formatDateIsoCalendar(recentWithExercises.date, {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </button>
      )}
      {sourceDays.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {sourceDays.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => onBorrowRoutine(day.date)}
              className="rounded-full border border-border px-3 py-1 font-label text-label-md text-text-2 transition-colors hover:border-primary hover:text-primary"
            >
              {formatDateIsoCalendar(day.date, {
                weekday: "short",
                day: "numeric",
              })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProtocolBorrowedBanner({
  sourceDate,
  targetDate,
  completedCount,
  totalCount,
  onFinish,
  onClear,
}: {
  sourceDate: string;
  targetDate: string;
  completedCount: number;
  totalCount: number;
  onFinish: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 text-left">
        <p className="font-label text-label-md font-semibold text-primary">
          Rutina prestada
        </p>
        <p className="text-body-md text-text-2">
          Ejercicios del{" "}
          {formatDateIsoCalendar(sourceDate, {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}{" "}
          para registrar el{" "}
          {formatDateIsoCalendar(targetDate, {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
          . Cada check se guarda al tocarlo ({completedCount}/{totalCount}).
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-border px-3 py-1.5 font-label text-label-md text-text-3 hover:bg-surface-3"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="rounded-lg bg-primary px-3 py-1.5 font-label text-label-md text-primary-foreground transition-all active:scale-95"
        >
          Listo
        </button>
      </div>
    </div>
  );
}
