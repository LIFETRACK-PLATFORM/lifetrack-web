export interface ExerciseScheduleInfo {
  daysOfWeek: number[];
  completions: string[];
}

export interface ProtocolStats {
  due: number;
  completed: number;
  remaining: number;
  percent: number;
}

/** Fecha calendario actual en UTC (YYYY-MM-DD), alineada con el backend rehab. */
export function todayDateIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Formatea YYYY-MM-DD como día calendario UTC (sin corrimiento por zona horaria local). */
export function formatDateIsoCalendar(
  dateIso: string,
  options: Intl.DateTimeFormatOptions,
  locale = "es-PE",
): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(locale, {
    ...options,
    timeZone: "UTC",
  });
}

export function isExerciseDueOnDate(
  exercise: ExerciseScheduleInfo,
  dateIso: string,
): boolean {
  const weekday = new Date(`${dateIso}T00:00:00.000Z`).getUTCDay();
  return (
    exercise.daysOfWeek.length === 0 || exercise.daysOfWeek.includes(weekday)
  );
}

export function isCompletedOnDate(
  exercise: ExerciseScheduleInfo,
  dateIso: string,
): boolean {
  return exercise.completions.includes(dateIso);
}

export function getExercisesDueOn<T extends ExerciseScheduleInfo>(
  exercises: readonly T[],
  dateIso: string,
): T[] {
  return exercises.filter((exercise) => isExerciseDueOnDate(exercise, dateIso));
}

export function getProtocolStatsForDate(
  exercises: readonly ExerciseScheduleInfo[],
  dateIso: string,
): ProtocolStats {
  const dueExercises = getExercisesDueOn(exercises, dateIso);
  const completed = dueExercises.filter((exercise) =>
    isCompletedOnDate(exercise, dateIso),
  ).length;
  const due = dueExercises.length;

  return {
    due,
    completed,
    remaining: Math.max(due - completed, 0),
    percent: due === 0 ? 0 : Math.round((completed / due) * 100),
  };
}

export function isFutureDate(
  dateIso: string,
  todayIso: string = todayDateIso(),
): boolean {
  return dateIso > todayIso;
}

export function formatProtocolTitle(
  dateIso: string,
  todayIso: string = todayDateIso(),
): string {
  if (dateIso === todayIso) {
    return "Protocolo de hoy";
  }

  const formatted = formatDateIsoCalendar(dateIso, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return `Protocolo del ${formatted}`;
}

export function formatCompletionLabel(
  dateIso: string,
  todayIso: string = todayDateIso(),
): string {
  if (dateIso === todayIso) {
    return "Completado hoy";
  }

  const formatted = formatDateIsoCalendar(dateIso, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `Completado (${formatted})`;
}
