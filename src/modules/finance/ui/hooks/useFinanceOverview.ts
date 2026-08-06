import { useCallback, useEffect, useState } from "react";
import { FinanceRepository } from "../../domain/FinanceRepository";
import {
  FinanceOverview,
  GetFinanceOverviewUseCase,
} from "../../application/GetFinanceOverviewUseCase";

export function useFinanceOverview(repository: FinanceRepository) {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });

    const getOverview = new GetFinanceOverviewUseCase(repository);
    getOverview
      .execute()
      .then((fetched) => {
        if (!cancelled) setOverview(fetched);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar finanzas",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository, reloadToken]);

  return { overview, loading, error, reload };
}
