import { AuthRepository } from "../domain/AuthRepository";

export class ConfirmEmailUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(token: string): Promise<void> {
    await this.authRepository.confirmEmail(token);
  }
}
