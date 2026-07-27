import { AuthRepository } from "../domain/AuthRepository";

export class ForgotPasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string): Promise<void> {
    await this.authRepository.forgotPassword(email);
  }
}
