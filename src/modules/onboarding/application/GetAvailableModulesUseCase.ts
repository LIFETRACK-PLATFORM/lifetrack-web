import { OnboardingModuleOption } from "../domain/OnboardingModuleOption";
import { OnboardingRepository } from "../domain/OnboardingRepository";

export class GetAvailableModulesUseCase {
  constructor(private readonly onboardingRepository: OnboardingRepository) {}

  async execute(): Promise<OnboardingModuleOption[]> {
    return await this.onboardingRepository.getAvailableModules();
  }
}
