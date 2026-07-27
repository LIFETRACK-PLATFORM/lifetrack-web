import { Appointment } from "../../domain/Appointment";
import { DashboardSummary } from "../../domain/DashboardSummary";
import { Exercise } from "../../domain/Exercise";
import { RehabPlan } from "../../domain/RehabPlan";
import type {
  RecoveryPlanSummaryDto,
  RecoveryProgressDto,
} from "../dtos/RecoveryProgressDto";

const DEFAULT_EXERCISE_IMAGE =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400";

function sumLogsReps(logs: { repsDone: number }[]): number {
  return logs.reduce((acc, log) => acc + log.repsDone, 0);
}

function mapExercise(dto: RecoveryProgressDto["exercises"][number]): Exercise {
  const current = sumLogsReps(dto.logs);
  const target = dto.targetSets * dto.targetReps;
  return new Exercise(
    {
      name: dto.name,
      detail: `${dto.targetSets} sets × ${dto.targetReps} reps`,
      icon: "fitness_center",
      current,
      target,
      completed: current >= target && target > 0,
      category: `phase-${dto.phase}`,
      sets: dto.targetSets,
      reps: dto.targetReps,
      image: DEFAULT_EXERCISE_IMAGE,
    },
    dto.exerciseId,
  );
}

function mapAppointment(dto: RecoveryProgressDto["appointments"][number]): Appointment {
  const date = new Date(dto.date);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate());
  return new Appointment(
    {
      month,
      day,
      title: dto.provider,
      detail: dto.notes ?? "Medical appointment",
    },
    dto.appointmentId,
  );
}

export function mapProgressToPlan(dto: RecoveryProgressDto): RehabPlan {
  const exercises = (dto.exercises ?? []).map(mapExercise);
  const completed = exercises.filter((e) => e.completed).length;
  const painMeasurement = (dto.measurements ?? []).find((m) =>
    m.type.includes("WEIGHT"),
  );

  return new RehabPlan(
    {
      titleMobile: dto.injuryType,
      titleWeb: `${dto.bodyPart} Recovery`,
      phaseLabel: `Phase ${dto.exercises[0]?.phase ?? 1}`,
      dayProgress: dto.status,
      weekLabel: new Date(dto.surgeryDate).toLocaleDateString(),
      statusMessage:
        completed === exercises.length && exercises.length > 0
          ? "All exercises completed"
          : "In progress",
      remainingToday: exercises.filter((e) => !e.completed).length,
      exercises,
      appointments: (dto.appointments ?? []).map(mapAppointment),
      metrics: {
        kneeExtensionNote: painMeasurement
          ? `${painMeasurement.value}${painMeasurement.unit}`
          : "No measurements yet",
        painLevel: dto.status === "ACTIVE" ? "Moderate" : "Low",
      },
    },
    dto.recoveryPlanId,
  );
}

export function mapProgressToDashboard(
  planSummary: RecoveryPlanSummaryDto,
  progress: RecoveryProgressDto,
): DashboardSummary {
  const exercises = (progress.exercises ?? []).map(mapExercise);
  const done = exercises.filter((e) => e.completed).length;
  const total = exercises.length || 1;
  const percent = Math.round((done / total) * 100);
  const nextAppt = (progress.appointments ?? [])[0];

  return new DashboardSummary(
    {
      planId: progress.recoveryPlanId,
      focusTitle: `${planSummary.bodyPart} — ${planSummary.injuryType}`,
      exerciseProgress: { done, total, percent },
      nextAppointment: nextAppt
        ? {
            title: "Next Medical Check-up",
            detail: `${nextAppt.provider} • ${new Date(nextAppt.date).toLocaleString()}`,
          }
        : { title: "No upcoming appointments", detail: "Schedule one with your provider" },
      weeklyCompliance: percent,
      weeklyBars: [percent, percent, percent, percent, percent, percent, percent],
      recoveryScore: percent,
      activeMinutes: done * 10,
      activeMinutesDelta: "",
      phase: {
        name: `Phase ${progress.exercises[0]?.phase ?? 1}`,
        percent,
        description: `Recovery plan status: ${planSummary.status}`,
      },
      todayExercises: exercises.slice(0, 3).map((ex) => ({
        id: ex.id,
        name: ex.name,
        detail: ex.detail,
        status: ex.completed ? "completed" : ("pending" as const),
      })),
      upNext: exercises.slice(0, 2).map((ex) => ({
        id: ex.id,
        name: ex.name,
        detail: ex.detail,
        icon: ex.icon,
        locked: false,
      })),
    },
    "dashboard",
  );
}
