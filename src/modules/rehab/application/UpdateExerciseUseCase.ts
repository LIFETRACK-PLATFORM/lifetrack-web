import { RehabRepository } from "../domain/RehabRepository";
import type { UpdateExerciseInput } from "../domain/RehabRepository";

export class UpdateExerciseUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(
    planId: string,
    exerciseId: string,
    input: UpdateExerciseInput,
  ): Promise<void> {
    await this.rehabRepository.updateExercise(planId, exerciseId, input);
  }
}
