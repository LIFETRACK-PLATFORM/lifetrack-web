import { RehabRepository } from "../domain/RehabRepository";

export class SetAdHocProtocolDayUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(
    planId: string,
    targetDate: string,
    sourceDate: string,
  ): Promise<void> {
    await this.rehabRepository.setAdHocProtocolDay(
      planId,
      targetDate,
      sourceDate,
    );
  }
}
