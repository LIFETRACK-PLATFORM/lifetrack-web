import { useEffect, useState } from "react";
import { OnboardingModuleOption } from "../../domain/OnboardingModuleOption";
import { OnboardingRepository } from "../../domain/OnboardingRepository";
import { GetAvailableModulesUseCase } from "../../application/GetAvailableModulesUseCase";
import { SaveOnboardingSelectionUseCase } from "../../application/SaveOnboardingSelectionUseCase";

export function useOnboardingSelection(repository: OnboardingRepository) {
  const [modules, setModules] = useState<OnboardingModuleOption[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(["rehab"]));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const useCase = new GetAvailableModulesUseCase(repository);
    useCase.execute().then(setModules);
  }, [repository]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function continueNext() {
    setLoading(true);
    const useCase = new SaveOnboardingSelectionUseCase(repository);
    await useCase.execute(Array.from(selected));
    setLoading(false);
    setSaved(true);
  }

  return { modules, selected, toggle, loading, saved, continueNext };
}
