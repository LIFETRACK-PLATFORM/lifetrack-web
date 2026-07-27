import { AuthRepository } from "../domain/AuthRepository";

export class ResetPasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(token: string, newPassword: string): Promise<void> {
    await this.authRepository.resetPassword(token, newPassword);
  }
}
