import { RehabPlan } from "../domain/RehabPlan";
import { GetPlanOptions, RehabRepository } from "../domain/RehabRepository";

export class GetPlanUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(id: string, options?: GetPlanOptions): Promise<RehabPlan> {
    return await this.rehabRepository.getPlan(id, options);
  }
}
