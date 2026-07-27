import { OnboardingRepository } from "../domain/OnboardingRepository";

export class SaveOnboardingSelectionUseCase {
  constructor(private readonly onboardingRepository: OnboardingRepository) {}

  async execute(ids: string[]): Promise<void> {
    await this.onboardingRepository.saveSelection(ids);
  }
}
