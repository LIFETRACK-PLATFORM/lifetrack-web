import { RehabRepository } from "../domain/RehabRepository";

export class DeleteMeasurementUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(measurementId: string): Promise<void> {
    await this.rehabRepository.deleteMeasurement(measurementId);
  }
}
