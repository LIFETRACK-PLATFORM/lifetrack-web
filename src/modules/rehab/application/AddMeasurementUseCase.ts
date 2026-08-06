import {
  AddMeasurementInput,
  RehabRepository,
} from "../domain/RehabRepository";

export class AddMeasurementUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(planId: string, input: AddMeasurementInput): Promise<void> {
    await this.rehabRepository.addMeasurement(planId, input);
  }
}
