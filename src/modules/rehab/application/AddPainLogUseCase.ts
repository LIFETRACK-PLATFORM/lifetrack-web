import { AddPainLogInput, RehabRepository } from "../domain/RehabRepository";

export class AddPainLogUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(planId: string, input: AddPainLogInput): Promise<void> {
    await this.rehabRepository.addPainLog(planId, input);
  }
}
