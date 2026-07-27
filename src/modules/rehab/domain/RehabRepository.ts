import { DashboardSummary } from "./DashboardSummary";
import { RehabPlan } from "./RehabPlan";

export interface CreateRecoveryPlanInput {
  bodyPart: string;
  injuryType: string;
  surgeryDate: string;
}

export interface RehabRepository {
  getDashboard(): Promise<DashboardSummary>;
  getPlan(id: string): Promise<RehabPlan>;
  updateExerciseProgress(
    planId: string,
    exerciseId: string,
    current: number,
  ): Promise<void>;
  createPlan(input: CreateRecoveryPlanInput): Promise<string>;
}
