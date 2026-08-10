import { DashboardSummary } from "./DashboardSummary";
import { RehabPlan } from "./RehabPlan";
import type { AppointmentType } from "./Appointment";

export type { AppointmentType };

export interface CreateRecoveryPlanInput {
  bodyPart: string;
  injuryType: string;
  surgeryDate: string;
}

export type ExerciseMetricType = "REPS" | "DURATION";

export interface AddExerciseInput {
  name: string;
  metricType: ExerciseMetricType;
  targetSets: number;
  targetReps: number;
  targetDurationMinutes?: number;
  referenceMediaUrl?: string;
  notes?: string;
  daysOfWeek?: number[];
}

export type UpdateExerciseInput = AddExerciseInput;

export interface AddAppointmentInput {
  title?: string;
  date: string;
  provider: string;
  type: AppointmentType;
  notes?: string;
  repeatWeeks?: number;
}

export interface AddPainLogInput {
  date: string;
  level: number;
  note?: string;
}

export type RecoveryPlanStatus = "ACTIVE" | "COMPLETED" | "PAUSED";

export type MeasurementType =
  | "FLEXION_DEGREES"
  | "EXTENSION_DEGREES"
  | "QUAD_CIRCUMFERENCE_CM"
  | "WEIGHT_KG"
  | "WAIST_CM"
  | "HIP_CM"
  | "NECK_CM"
  | "OTHER";

export interface AddMeasurementInput {
  type: MeasurementType;
  customLabel?: string;
  value: number;
  unit: string;
  date: string;
}

export type UpdateMeasurementInput = AddMeasurementInput;

export interface GetPlanOptions {
  weekReferenceDate?: string;
}

export interface InactivePlanSummary {
  planId: string;
  bodyPart: string;
  injuryType: string;
  status: Exclude<RecoveryPlanStatus, "ACTIVE">;
}

export interface DashboardBundle {
  active: DashboardSummary[];
  inactive: InactivePlanSummary[];
}

export interface RehabRepository {
  /** Planes activos (detalle) + pausados/completados (resumen). */
  getDashboard(): Promise<DashboardBundle>;
  getPlan(id: string, options?: GetPlanOptions): Promise<RehabPlan>;
  updateExerciseProgress(
    planId: string,
    exerciseId: string,
    current: number,
    date?: string,
  ): Promise<void>;
  markExerciseCompletion(
    exerciseId: string,
    date: string,
    completed: boolean,
  ): Promise<void>;
  createPlan(input: CreateRecoveryPlanInput): Promise<string>;
  updatePlanStatus(planId: string, status: RecoveryPlanStatus): Promise<void>;
  deletePlan(planId: string): Promise<void>;
  addExercise(planId: string, input: AddExerciseInput): Promise<void>;
  updateExercise(
    planId: string,
    exerciseId: string,
    input: UpdateExerciseInput,
  ): Promise<void>;
  deleteExercise(planId: string, exerciseId: string): Promise<void>;
  addAppointment(planId: string, input: AddAppointmentInput): Promise<void>;
  updateAppointment(
    appointmentId: string,
    input: AddAppointmentInput,
  ): Promise<void>;
  deleteAppointment(planId: string, appointmentId: string): Promise<void>;
  markAppointmentAttendance(
    appointmentId: string,
    attended: boolean,
  ): Promise<void>;
  addPainLog(planId: string, input: AddPainLogInput): Promise<void>;
  addMeasurement(planId: string, input: AddMeasurementInput): Promise<void>;
  updateMeasurement(
    measurementId: string,
    input: UpdateMeasurementInput,
  ): Promise<void>;
  deleteMeasurement(measurementId: string): Promise<void>;
  setAdHocProtocolDay(
    planId: string,
    targetDate: string,
    sourceDate: string,
  ): Promise<void>;
  clearAdHocProtocolDay(planId: string, targetDate: string): Promise<void>;
}
