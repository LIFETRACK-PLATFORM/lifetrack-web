import { AuthRepository } from "../domain/AuthRepository";

export class ResendVerificationUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string): Promise<void> {
    await this.authRepository.resendVerification(email);
  }
}
