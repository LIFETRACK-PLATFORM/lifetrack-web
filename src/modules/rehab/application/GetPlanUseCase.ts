import { RehabPlan } from "../domain/RehabPlan";
import { RehabRepository } from "../domain/RehabRepository";

export class GetPlanUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(id: string): Promise<RehabPlan> {
    return await this.rehabRepository.getPlan(id);
  }
}
