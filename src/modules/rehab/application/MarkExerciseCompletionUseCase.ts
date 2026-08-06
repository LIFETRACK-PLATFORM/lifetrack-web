import { RehabRepository } from "../domain/RehabRepository";

export class MarkExerciseCompletionUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(exerciseId: string, date: string, completed: boolean): Promise<void> {
    await this.rehabRepository.markExerciseCompletion(exerciseId, date, completed);
  }
}
