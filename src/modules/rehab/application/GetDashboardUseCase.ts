import { DashboardSummary } from "../domain/DashboardSummary";
import { RehabRepository } from "../domain/RehabRepository";

export class GetDashboardUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(): Promise<DashboardSummary> {
    return await this.rehabRepository.getDashboard();
  }
}
