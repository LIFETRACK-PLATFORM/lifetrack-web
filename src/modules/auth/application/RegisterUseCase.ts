import { RegisterData } from "../domain/RegisterData";
import { AuthRepository } from "../domain/AuthRepository";

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(data: RegisterData): Promise<void> {
    await this.authRepository.register(data);
  }
}
