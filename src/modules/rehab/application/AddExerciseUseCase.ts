import { AddExerciseInput, RehabRepository } from "../domain/RehabRepository";

export class AddExerciseUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(planId: string, input: AddExerciseInput): Promise<void> {
    await this.rehabRepository.addExercise(planId, input);
  }
}
