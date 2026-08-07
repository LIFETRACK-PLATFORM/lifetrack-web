import {
  RehabRepository,
  UpdateMeasurementInput,
} from "../domain/RehabRepository";

export class UpdateMeasurementUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(
    measurementId: string,
    input: UpdateMeasurementInput,
  ): Promise<void> {
    await this.rehabRepository.updateMeasurement(measurementId, input);
  }
}
