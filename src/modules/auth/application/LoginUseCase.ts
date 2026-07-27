import { Credentials } from "../domain/Credentials";
import { AuthRepository } from "../domain/AuthRepository";

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(credentials: Credentials): Promise<void> {
    await this.authRepository.login(credentials);
  }
}
