import { AuthRepository } from "../domain/AuthRepository";

export class LinkAccountUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(input: {
    provider: string;
    linkToken: string;
    password: string;
  }): Promise<void> {
    return this.authRepository.linkAccount(input);
  }
}
