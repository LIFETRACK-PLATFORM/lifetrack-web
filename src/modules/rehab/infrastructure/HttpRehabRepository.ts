import { DashboardSummary } from "../domain/DashboardSummary";
import { RehabPlan } from "../domain/RehabPlan";
import { AddExerciseInput, RehabRepository } from "../domain/RehabRepository";
import type {
  RecoveryPlanSummaryDto,
  RecoveryProgressDto,
} from "./dtos/RecoveryProgressDto";
import { rehabFetchStrict } from "./http/rehabHttpClient";
import {
  mapProgressToDashboard,
  mapProgressToPlan,
} from "./mappers/RecoveryProgressMapper";

export class NoRecoveryPlansError extends Error {
  constructor() {
    super("No hay planes de recuperación");
  }
}

export class HttpRehabRepository implements RehabRepository {
  async getDashboard(): Promise<DashboardSummary> {
    const { plans = [] } = await rehabFetchStrict<{ plans?: RecoveryPlanSummaryDto[] }>(
      "/rehab/plans",
    );
    if (plans.length === 0) {
      throw new NoRecoveryPlansError();
    }

    const focus = plans[0];
    const progress = await rehabFetchStrict<RecoveryProgressDto>(
      `/rehab/plans/${focus.recoveryPlanId}/progress`,
    );
    return mapProgressToDashboard(focus, progress);
  }

  async getPlan(id: string): Promise<RehabPlan> {
    const progress = await rehabFetchStrict<RecoveryProgressDto>(
      `/rehab/plans/${id}/progress`,
    );
    return mapProgressToPlan(progress);
  }

  async updateExerciseProgress(
    _planId: string,
    exerciseId: string,
    current: number,
  ): Promise<void> {
    await rehabFetchStrict(`/rehab/exercises/${exerciseId}/logs`, {
      method: "POST",
      body: JSON.stringify({
        setsDone: 1,
        repsDone: current,
        date: new Date().toISOString(),
      }),
    });
  }

  async createPlan(input: {
    bodyPart: string;
    injuryType: string;
    surgeryDate: string;
  }): Promise<string> {
    const result = await rehabFetchStrict<{ recoveryPlanId: string }>(
      "/rehab/plans",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    return result.recoveryPlanId;
  }

  async addExercise(planId: string, input: AddExerciseInput): Promise<void> {
    await rehabFetchStrict(`/rehab/plans/${planId}/exercises`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
}
