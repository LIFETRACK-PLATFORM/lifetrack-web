import { AuthRepository } from "../domain/AuthRepository";
import { CurrentUser } from "../domain/CurrentUser";

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<CurrentUser> {
    return this.authRepository.getCurrentUser();
  }
}
