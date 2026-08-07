import { RehabRepository } from "../domain/RehabRepository";

export class ClearAdHocProtocolDayUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(planId: string, targetDate: string): Promise<void> {
    await this.rehabRepository.clearAdHocProtocolDay(planId, targetDate);
  }
}
