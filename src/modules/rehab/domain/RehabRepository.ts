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
  addExercise(planId: string, input: AddExerciseInput): Promise<void>;
  addAppointment(planId: string, input: AddAppointmentInput): Promise<void>;
  addPainLog(planId: string, input: AddPainLogInput): Promise<void>;
}
