import { RehabRepository } from "../domain/RehabRepository";

export class DeleteAppointmentUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(planId: string, appointmentId: string): Promise<void> {
    await this.rehabRepository.deleteAppointment(planId, appointmentId);
  }
}
