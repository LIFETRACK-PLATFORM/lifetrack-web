import { AddAppointmentInput, RehabRepository } from "../domain/RehabRepository";

export class UpdateAppointmentUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(
    appointmentId: string,
    input: AddAppointmentInput,
  ): Promise<void> {
    await this.rehabRepository.updateAppointment(appointmentId, input);
  }
}
