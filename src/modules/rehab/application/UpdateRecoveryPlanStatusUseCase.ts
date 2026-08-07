import { RecoveryPlanStatus, RehabRepository } from "../domain/RehabRepository";

export class UpdateRecoveryPlanStatusUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(planId: string, status: RecoveryPlanStatus): Promise<void> {
    await this.rehabRepository.updatePlanStatus(planId, status);
  }
}
