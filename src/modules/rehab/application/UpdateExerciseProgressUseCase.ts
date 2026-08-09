import { RehabRepository } from "../domain/RehabRepository";

export class UpdateExerciseProgressUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(
    planId: string,
    exerciseId: string,
    current: number,
    date?: string,
  ): Promise<void> {
    await this.rehabRepository.updateExerciseProgress(
      planId,
      exerciseId,
      current,
      date,
    );
  }
}
