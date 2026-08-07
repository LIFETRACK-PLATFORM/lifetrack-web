import { DashboardSummary } from "./DashboardSummary";
import { RehabPlan } from "./RehabPlan";
import type { AppointmentType } from "./Appointment";

export type { AppointmentType };

export interface CreateRecoveryPlanInput {
  bodyPart: string;
  injuryType: string;
  surgeryDate: string;
}

export interface AddExerciseInput {
  name: string;
  targetSets: number;
  targetReps: number;
  phase: number;
  referenceMediaUrl?: string;
  daysOfWeek?: number[];
}

export type UpdateExerciseInput = AddExerciseInput;

export interface AddAppointmentInput {
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
  | "WEIGHT_KG";

export interface AddMeasurementInput {
  type: MeasurementType;
  value: number;
  unit: string;
  date: string;
}

export interface RehabRepository {
  /** Todos los planes activos del usuario, cada uno con su propio resumen. */
  getDashboard(): Promise<DashboardSummary[]>;
  getPlan(id: string): Promise<RehabPlan>;
  updateExerciseProgress(
    planId: string,
    exerciseId: string,
    current: number,
  ): Promise<void>;
  markExerciseCompletion(
    exerciseId: string,
    date: string,
    completed: boolean,
  ): Promise<void>;
  createPlan(input: CreateRecoveryPlanInput): Promise<string>;
  updatePlanStatus(planId: string, status: RecoveryPlanStatus): Promise<void>;
  addExercise(planId: string, input: AddExerciseInput): Promise<void>;
  updateExercise(
    planId: string,
    exerciseId: string,
    input: UpdateExerciseInput,
  ): Promise<void>;
  deleteExercise(planId: string, exerciseId: string): Promise<void>;
  addAppointment(planId: string, input: AddAppointmentInput): Promise<void>;
  deleteAppointment(planId: string, appointmentId: string): Promise<void>;
  markAppointmentAttendance(
    appointmentId: string,
    attended: boolean,
  ): Promise<void>;
  addPainLog(planId: string, input: AddPainLogInput): Promise<void>;
  addMeasurement(planId: string, input: AddMeasurementInput): Promise<void>;
}
