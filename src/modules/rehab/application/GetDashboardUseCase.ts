import {
  DashboardBundle,
  RehabRepository,
} from "../domain/RehabRepository";

export class GetDashboardUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(): Promise<DashboardBundle> {
    return await this.rehabRepository.getDashboard();
  }
}
