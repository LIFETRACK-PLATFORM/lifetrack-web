import { Appointment } from "../../domain/Appointment";
import { DashboardSummary } from "../../domain/DashboardSummary";
import { Exercise } from "../../domain/Exercise";
import { RehabPlan, MeasurementPoint } from "../../domain/RehabPlan";
import type { MeasurementType } from "../../domain/RehabRepository";
import type {
  RecoveryPlanSummaryDto,
  RecoveryProgressDto,
  TodayExerciseDto,
  GetTodayExercisesResponseDto,
  WeeklySummaryDto,
} from "../dtos/RecoveryProgressDto";
import { sumRepsForDate, todayDateIso } from "../../domain/protocolSchedule";

const DEFAULT_EXERCISE_IMAGE =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400";

function mapExerciseLogs(
  logs: RecoveryProgressDto["exercises"][number]["logs"],
): { date: string; repsDone: number }[] {
  return (logs ?? []).map((log) => ({
    date: log.date.slice(0, 10),
    repsDone: log.repsDone,
  }));
}

function mapExercise(
  dto: RecoveryProgressDto["exercises"][number],
  todayById: Map<string, TodayExerciseDto>,
): Exercise {
  const mappedLogs = mapExerciseLogs(dto.logs);
  const todayIso = todayDateIso();
  const current = sumRepsForDate(mappedLogs, todayIso);
  const isDuration = dto.metricType === "DURATION";
  const target = isDuration
    ? dto.targetDurationMinutes ?? 0
    : dto.targetSets * dto.targetReps;
  const detail = isDuration
    ? `${dto.targetDurationMinutes ?? 0} min`
    : `${dto.targetSets} sets × ${dto.targetReps} reps`;
  const today = todayById.get(dto.exerciseId);
  return new Exercise(
    {
      name: dto.name,
      detail,
      icon: "fitness_center",
      current,
      target,
      completed: current >= target && target > 0,
      metricType: dto.metricType,
      targetDurationMinutes: dto.targetDurationMinutes ?? null,
      notes: dto.notes ?? null,
      sets: dto.targetSets,
      reps: dto.targetReps,
      image: DEFAULT_EXERCISE_IMAGE,
      daysOfWeek: dto.daysOfWeek ?? [],
      completions: (dto.completions ?? []).map((c) => c.date),
      logs: mappedLogs,
      scheduledToday: today?.scheduledToday ?? false,
      // completedToday viene directo del progreso (cubre todos los ejercicios,
      // no solo los "due" hoy/ayer que devuelve GetTodayExercises).
      completedToday: dto.completedToday,
      urgent: today?.urgent ?? false,
    },
    dto.exerciseId,
  );
}

function mapAppointment(dto: RecoveryProgressDto["appointments"][number]): Appointment {
  const date = new Date(dto.date);
  const month = date.toLocaleString("es-AR", { month: "short" });
  const day = String(date.getDate());
  return new Appointment(
    {
      month,
      day,
      title: dto.title ?? dto.provider,
      detail:
        dto.notes ?? (dto.type === "THERAPY" ? "Sesión de terapia" : "Cita médica"),
      provider: dto.provider,
      notes: dto.notes ?? null,
      type: dto.type,
      date: dto.date,
      attended: dto.attended ?? null,
      rescheduledFrom: dto.rescheduledFromDate ?? null,
    },
    dto.appointmentId,
  );
}

function mapAdHocProtocolDays(
  entries: RecoveryProgressDto["adHocProtocolDays"],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const entry of entries ?? []) {
    map[entry.targetDate] = entry.sourceDate;
  }
  return map;
}

export function mapProgressToPlan(
  dto: RecoveryProgressDto,
  today: GetTodayExercisesResponseDto,
  weeklySummary: WeeklySummaryDto,
): RehabPlan {
  const todayById = new Map(today.exercises.map((e) => [e.exerciseId, e]));
  const exercises = (dto.exercises ?? []).map((e) => mapExercise(e, todayById));
  const scheduledToday = exercises.filter((e) => e.scheduledToday);
  const completedToday = scheduledToday.filter((e) => e.completedToday).length;
  const extensionMeasurements = (dto.measurements ?? [])
    .filter((m) => m.type.includes("EXTENSION"))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  const latestExtension =
    extensionMeasurements[extensionMeasurements.length - 1];
  const measurements: MeasurementPoint[] = (dto.measurements ?? [])
    .map((m) => ({
      measurementId: m.measurementId,
      type: m.type as MeasurementType,
      customLabel: m.customLabel,
      value: m.value,
      unit: m.unit,
      date: m.date,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedPainLogs = [...(dto.painLogs ?? [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const latestPain = sortedPainLogs[sortedPainLogs.length - 1];

  return new RehabPlan(
    {
      titleMobile: dto.injuryType,
      titleWeb: `${dto.bodyPart} Recovery`,
      phaseLabel: "Plan de recuperación",
      dayProgress: dto.status,
      status: dto.status as RehabPlan["status"],
      weekLabel: new Date(dto.surgeryDate).toLocaleDateString(),
      statusMessage:
        scheduledToday.length > 0 && completedToday === scheduledToday.length
          ? "Ejercicios de hoy completados"
          : "En progreso",
      remainingToday: Math.max(scheduledToday.length - completedToday, 0),
      exercises,
      appointments: (dto.appointments ?? []).map(mapAppointment),
      metrics: {
        kneeExtensionNote: latestExtension
          ? `${latestExtension.value}${latestExtension.unit}`
          : "Sin mediciones aún",
        painLevel: latestPain ? `${latestPain.level}/10` : "Sin registrar",
      },
      painHistory: sortedPainLogs.map((p) => ({
        date: p.date,
        level: p.level,
        note: p.note,
      })),
      measurements,
      weeklyDays: weeklySummary.days,
      weeklyCompliancePercent: weeklySummary.weeklyCompliancePercent,
      weekStart: weeklySummary.weekStart,
      weekEnd: weeklySummary.weekEnd,
      streakDays: weeklySummary.streakDays,
      completedTodayCount: completedToday,
      scheduledTodayCount: scheduledToday.length,
      adHocProtocolDays: mapAdHocProtocolDays(dto.adHocProtocolDays),
    },
    dto.recoveryPlanId,
  );
}

export function mapProgressToDashboard(
  planSummary: RecoveryPlanSummaryDto,
  progress: RecoveryProgressDto,
  today: GetTodayExercisesResponseDto,
  weeklySummary: WeeklySummaryDto,
): DashboardSummary {
  const scheduledToday = today.exercises.filter((e) => e.scheduledToday);
  const done = scheduledToday.filter((e) => e.completedToday).length;
  const total = scheduledToday.length;
  const percent = total === 0 ? 100 : Math.round((done / total) * 100);

  const now = new Date();
  const sortedAppointments = [...(progress.appointments ?? [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const nextAppt =
    sortedAppointments.find((a) => new Date(a.date).getTime() >= now.getTime()) ??
    sortedAppointments[0];

  return new DashboardSummary(
    {
      planId: progress.recoveryPlanId,
      focusTitle: `${planSummary.bodyPart} — ${planSummary.injuryType}`,
      exerciseProgress: { done, total, percent },
      nextAppointment: nextAppt
        ? {
            title:
              nextAppt.type === "THERAPY"
                ? "Próxima sesión de terapia"
                : "Próximo chequeo médico",
            detail: `${nextAppt.provider} • ${new Date(nextAppt.date).toLocaleString()}`,
          }
        : { title: "Sin citas próximas", detail: "Agenda una con tu profesional" },
      weeklyCompliance: weeklySummary.weeklyCompliancePercent,
      weeklyBars: weeklySummary.days.map((d) =>
        d.due === 0 ? 0 : Math.round((d.completed / d.due) * 100),
      ),
      recoveryScore: weeklySummary.weeklyCompliancePercent,
      streakDays: weeklySummary.streakDays,
      phase: {
        name: "Plan de recuperación",
        percent: weeklySummary.weeklyCompliancePercent,
        description: `Recovery plan status: ${planSummary.status}`,
      },
      todayExercises: today.exercises.map((ex) => ({
        id: ex.exerciseId,
        name: ex.name,
        detail: `${ex.targetSets} sets × ${ex.targetReps} reps`,
        status: ex.completedToday
          ? "completed"
          : ex.urgent
            ? "urgent"
            : ("pending" as const),
      })),
      upNext: today.exercises
        .filter((e) => !e.completedToday)
        .slice(0, 2)
        .map((ex) => ({
          id: ex.exerciseId,
          name: ex.name,
          detail: `${ex.targetSets} sets × ${ex.targetReps} reps`,
          icon: "fitness_center",
          locked: false,
        })),
    },
    "dashboard",
  );
}
