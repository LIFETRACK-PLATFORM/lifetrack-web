import { OnboardingModuleOption } from "../domain/OnboardingModuleOption";
import { OnboardingRepository } from "../domain/OnboardingRepository";

const modules: OnboardingModuleOption[] = [
  new OnboardingModuleOption(
    {
      title: "Sports Recovery",
      titleWeb: "Sports Recovery (Rehab)",
      description:
        "Optimize athletic performance with templates for sleep, injury rehab, and mobility.",
      descriptionWeb:
        "Our specialized recovery module for athletes. Includes mobility flows, injury tracking, and sleep optimization.",
      icon: "stabilization",
      recommended: true,
      tags: ["HRV Sync", "Sleep Logs", "PT Guide"],
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCsOWw2DxzN9f4nbBAhq2_QkEAp3n4Zh5fent6hm2mYMpdm-g69REgC9FoZ9jx6xGOihUGQzYhxJ2VIlPFZTHmP1Pe78iRrsO_g-h_f5CtJr4teK7csa6YyDjscGz9dt030gO_c54hZuIpMxD8LBX1sp4PrXMhSUSD6mFD2rO0PVUva-_102JbLHlPwPuXpGo_6ajkXHzHNAOLZuXNT42tlqB5sterEKuDcKzZCPyYCLXanBUiLqYPZAw",
    },
    "rehab",
  ),
  new OnboardingModuleOption(
    {
      title: "Tasks & Rituals",
      titleWeb: "Tasks",
      description:
        "High-density habit tracking and deep work task scheduling system.",
      descriptionWeb:
        "Advanced productivity and project management for your daily flow.",
      icon: "task_alt",
      recommended: false,
      tags: [],
    },
    "tasks",
  ),
  new OnboardingModuleOption(
    {
      title: "Finance Vault",
      titleWeb: "Finance",
      description:
        "Aggregate health-related expenses and insurance claim tracking.",
      descriptionWeb:
        "Keep track of your capital with medical-grade precision and clarity.",
      icon: "payments",
      recommended: false,
      tags: [],
    },
    "finance",
  ),
  new OnboardingModuleOption(
    {
      title: "Data Vault",
      titleWeb: "Vault",
      description:
        "Encrypted storage for medical records, lab results, and genomic data.",
      descriptionWeb:
        "Encrypted secure storage for sensitive identity and health records.",
      icon: "encrypted",
      recommended: false,
      tags: [],
    },
    "vault",
  ),
];

export class MockOnboardingRepository implements OnboardingRepository {
  async getAvailableModules(): Promise<OnboardingModuleOption[]> {
    return modules;
  }

  async saveSelection(_ids: string[]): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 700));
  }
}
