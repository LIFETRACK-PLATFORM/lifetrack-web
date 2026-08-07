import { DashboardSummary } from "../domain/DashboardSummary";
import { RehabPlan } from "../domain/RehabPlan";
import {
  AddAppointmentInput,
  AddExerciseInput,
  AddMeasurementInput,
  AddPainLogInput,
  RecoveryPlanStatus,
  RehabRepository,
} from "../domain/RehabRepository";
import type {
  GetTodayExercisesResponseDto,
  RecoveryPlanSummaryDto,
  RecoveryProgressDto,
  WeeklySummaryDto,
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
  private getToday(planId: string) {
    return rehabFetchStrict<GetTodayExercisesResponseDto>(
      `/rehab/plans/${planId}/today`,
    );
  }

  private getWeeklySummary(planId: string) {
    return rehabFetchStrict<WeeklySummaryDto>(
      `/rehab/plans/${planId}/weekly-summary`,
    );
  }

  private getProgress(planId: string) {
    return rehabFetchStrict<RecoveryProgressDto>(
      `/rehab/plans/${planId}/progress`,
    );
  }

  async getDashboard(): Promise<DashboardSummary[]> {
    const { plans = [] } = await rehabFetchStrict<{ plans?: RecoveryPlanSummaryDto[] }>(
      "/rehab/plans",
    );
    const activePlans = plans.filter((p) => p.status === "ACTIVE");
    if (activePlans.length === 0) {
      throw new NoRecoveryPlansError();
    }

    return Promise.all(
      activePlans.map(async (planSummary) => {
        const [progress, today, weeklySummary] = await Promise.all([
          this.getProgress(planSummary.recoveryPlanId),
          this.getToday(planSummary.recoveryPlanId),
          this.getWeeklySummary(planSummary.recoveryPlanId),
        ]);
        return mapProgressToDashboard(planSummary, progress, today, weeklySummary);
      }),
    );
  }

  async getPlan(id: string): Promise<RehabPlan> {
    const [progress, today, weeklySummary] = await Promise.all([
      this.getProgress(id),
      this.getToday(id),
      this.getWeeklySummary(id),
    ]);
    return mapProgressToPlan(progress, today, weeklySummary);
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

  async markExerciseCompletion(
    exerciseId: string,
    date: string,
    completed: boolean,
  ): Promise<void> {
    await rehabFetchStrict(`/rehab/exercises/${exerciseId}/completions`, {
      method: "POST",
      body: JSON.stringify({ date, completed }),
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

  async updatePlanStatus(
    planId: string,
    status: RecoveryPlanStatus,
  ): Promise<void> {
    await rehabFetchStrict(`/rehab/plans/${planId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async addExercise(planId: string, input: AddExerciseInput): Promise<void> {
    await rehabFetchStrict(`/rehab/plans/${planId}/exercises`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async deleteExercise(_planId: string, exerciseId: string): Promise<void> {
    await rehabFetchStrict(`/rehab/exercises/${exerciseId}`, {
      method: "DELETE",
    });
  }

  async addAppointment(
    planId: string,
    input: AddAppointmentInput,
  ): Promise<void> {
    await rehabFetchStrict(`/rehab/plans/${planId}/appointments`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async markAppointmentAttendance(
    appointmentId: string,
    attended: boolean,
  ): Promise<void> {
    await rehabFetchStrict(`/rehab/appointments/${appointmentId}/attendance`, {
      method: "PATCH",
      body: JSON.stringify({ attended }),
    });
  }

  async addPainLog(planId: string, input: AddPainLogInput): Promise<void> {
    await rehabFetchStrict(`/rehab/plans/${planId}/pain-logs`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async addMeasurement(
    planId: string,
    input: AddMeasurementInput,
  ): Promise<void> {
    await rehabFetchStrict(`/rehab/plans/${planId}/measurements`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
}
