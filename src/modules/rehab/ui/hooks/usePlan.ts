import { useCallback, useEffect, useState } from "react";
import { RehabPlan } from "../../domain/RehabPlan";
import { RehabRepository } from "../../domain/RehabRepository";
import { GetPlanUseCase } from "../../application/GetPlanUseCase";
import { UpdateExerciseProgressUseCase } from "../../application/UpdateExerciseProgressUseCase";
import { RehabApiError } from "../../infrastructure/http/rehabHttpClient";

export function usePlan(repository: RehabRepository, planId: string) {
  const [plan, setPlan] = useState<RehabPlan | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      setNotFound(false);
    });

    const getPlan = new GetPlanUseCase(repository);
    getPlan
      .execute(planId)
      .then((fetched) => {
        if (cancelled) return;
        setPlan(fetched);
        const initial: Record<string, number> = {};
        for (const exercise of fetched.exercises) {
          initial[exercise.id] = exercise.current;
        }
        setCounts(initial);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof RehabApiError && err.status === 404) {
          setNotFound(true);
          return;
        }
        setError(err instanceof Error ? err.message : "Error al cargar plan");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository, planId]);

  const adjust = useCallback(
    async (exerciseId: string, delta: number, target: number) => {
      if (!plan) return;
      const prev = counts[exerciseId] ?? 0;
      const next = Math.max(0, Math.min(target, prev + delta));
      setCounts((current) => ({ ...current, [exerciseId]: next }));
      setSaveError(null);

      try {
        const useCase = new UpdateExerciseProgressUseCase(repository);
        await useCase.execute(plan.id, exerciseId, next);
      } catch (err) {
        setCounts((current) => ({ ...current, [exerciseId]: prev }));
        setSaveError(
          err instanceof Error ? err.message : "No se pudo guardar progreso",
        );
      }
    },
    [counts, plan, repository],
  );

  return { plan, counts, adjust, loading, error, notFound, saveError };
}
