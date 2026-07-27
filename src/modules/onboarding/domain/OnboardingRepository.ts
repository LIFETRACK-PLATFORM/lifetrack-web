import { OnboardingModuleOption } from "./OnboardingModuleOption";

export interface OnboardingRepository {
  getAvailableModules(): Promise<OnboardingModuleOption[]>;
  saveSelection(ids: string[]): Promise<void>;
}
