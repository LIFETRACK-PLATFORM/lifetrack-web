import { RehabRepository } from "../domain/RehabRepository";

export class MarkAppointmentAttendanceUseCase {
  constructor(private readonly rehabRepository: RehabRepository) {}

  async execute(appointmentId: string, attended: boolean): Promise<void> {
    await this.rehabRepository.markAppointmentAttendance(
      appointmentId,
      attended,
    );
  }
}
