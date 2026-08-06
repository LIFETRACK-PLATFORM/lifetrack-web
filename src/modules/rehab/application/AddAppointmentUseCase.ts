import { AddAppointmentInput, RehabRepository } from "../domain/RehabRepository";

export class AddAppointmentUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(planId: string, input: AddAppointmentInput): Promise<void> {
    await this.rehabRepository.addAppointment(planId, input);
  }
}
