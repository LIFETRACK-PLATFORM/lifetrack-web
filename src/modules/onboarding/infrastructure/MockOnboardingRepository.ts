import { OnboardingModuleOption } from "../domain/OnboardingModuleOption";
import { OnboardingRepository } from "../domain/OnboardingRepository";

const modules: OnboardingModuleOption[] = [
  new OnboardingModuleOption(
    {
      title: "Recuperación Deportiva",
      titleWeb: "Recuperación Deportiva (Rehab)",
      description:
        "Optimiza tu rendimiento con plantillas de sueño, rehabilitación de lesiones y movilidad.",
      descriptionWeb:
        "Nuestro módulo especializado de recuperación para deportistas. Incluye rutinas de movilidad, seguimiento de lesiones y optimización del sueño.",
      icon: "stabilization",
      recommended: true,
      tags: ["Sincronía HRV", "Registro de sueño", "Guía de fisioterapia"],
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCsOWw2DxzN9f4nbBAhq2_QkEAp3n4Zh5fent6hm2mYMpdm-g69REgC9FoZ9jx6xGOihUGQzYhxJ2VIlPFZTHmP1Pe78iRrsO_g-h_f5CtJr4teK7csa6YyDjscGz9dt030gO_c54hZuIpMxD8LBX1sp4PrXMhSUSD6mFD2rO0PVUva-_102JbLHlPwPuXpGo_6ajkXHzHNAOLZuXNT42tlqB5sterEKuDcKzZCPyYCLXanBUiLqYPZAw",
    },
    "rehab",
  ),
  new OnboardingModuleOption(
    {
      title: "Tareas y Rutinas",
      titleWeb: "Tareas",
      description:
        "Sistema de seguimiento de hábitos y planificación de tareas de trabajo profundo.",
      descriptionWeb:
        "Productividad avanzada y gestión de proyectos para tu flujo diario.",
      icon: "task_alt",
      recommended: false,
      tags: [],
    },
    "tasks",
  ),
  new OnboardingModuleOption(
    {
      title: "Bóveda Financiera",
      titleWeb: "Finanzas",
      description:
        "Agrupa gastos relacionados con salud y seguimiento de reclamos de seguro.",
      descriptionWeb:
        "Lleva el control de tu capital con precisión y claridad de grado médico.",
      icon: "payments",
      recommended: false,
      tags: [],
    },
    "finance",
  ),
  new OnboardingModuleOption(
    {
      title: "Bóveda de Datos",
      titleWeb: "Bóveda",
      description:
        "Almacenamiento cifrado para historiales médicos, resultados de laboratorio y datos genómicos.",
      descriptionWeb:
        "Almacenamiento seguro y cifrado para registros sensibles de identidad y salud.",
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
