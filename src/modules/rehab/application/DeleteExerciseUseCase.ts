import { RehabRepository } from "../domain/RehabRepository";

export class DeleteExerciseUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(planId: string, exerciseId: string): Promise<void> {
    await this.rehabRepository.deleteExercise(planId, exerciseId);
  }
}
