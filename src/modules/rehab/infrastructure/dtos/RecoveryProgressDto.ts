export interface RecoveryPlanSummaryDto {
  recoveryPlanId: string;
  bodyPart: string;
  injuryType: string;
  surgeryDate: string;
  status: string;
}

export interface ExerciseLogEntryDto {
  exerciseLogId: string;
  setsDone: number;
  repsDone: number;
  date: string;
}

export interface ExerciseCompletionEntryDto {
  exerciseCompletionId: string;
  date: string;
}

export type ExerciseMetricTypeDto = "REPS" | "DURATION";

export interface ExerciseProgressDto {
  exerciseId: string;
  name: string;
  metricType: ExerciseMetricTypeDto;
  targetSets: number;
  targetReps: number;
  targetDurationMinutes?: number;
  notes?: string;
  logs: ExerciseLogEntryDto[];
  daysOfWeek: number[];
  completions: ExerciseCompletionEntryDto[];
  completedToday: boolean;
}

export type AppointmentTypeDto = "THERAPY" | "MEDICAL";

export interface AppointmentDto {
  appointmentId: string;
  recoveryPlanId: string;
  title?: string;
  date: string;
  provider: string;
  type: AppointmentTypeDto;
  notes?: string;
  attended?: boolean;
}

export interface MeasurementDto {
  measurementId: string;
  recoveryPlanId: string;
  type: string;
  value: number;
  unit: string;
  date: string;
}

export interface PainLogDto {
  painLogId: string;
  recoveryPlanId: string;
  date: string;
  level: number;
  note?: string;
}

export interface AdHocProtocolDayDto {
  adHocProtocolDayId: string;
  targetDate: string;
  sourceDate: string;
}

export interface RecoveryProgressDto {
  recoveryPlanId: string;
  bodyPart: string;
  injuryType: string;
  surgeryDate: string;
  status: string;
  exercises: ExerciseProgressDto[];
  appointments: AppointmentDto[];
  measurements: MeasurementDto[];
  progressPhotos: unknown[];
  painLogs: PainLogDto[];
  adHocProtocolDays?: AdHocProtocolDayDto[];
}

export interface TodayExerciseDto {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  scheduledToday: boolean;
  completedToday: boolean;
  urgent: boolean;
}

export interface GetTodayExercisesResponseDto {
  exercises: TodayExerciseDto[];
}

export interface WeeklySummaryDayDto {
  date: string;
  due: number;
  completed: number;
  compliant: boolean;
  isFuture: boolean;
}

export interface WeeklySummaryDto {
  recoveryPlanId: string;
  weekStart: string;
  weekEnd: string;
  days: WeeklySummaryDayDto[];
  weeklyCompliancePercent: number;
  appointmentsByType: { therapy: number; medical: number };
  streakDays: number;
}
