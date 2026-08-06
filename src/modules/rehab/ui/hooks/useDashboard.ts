import { useEffect, useState } from "react";
import { DashboardSummary } from "../../domain/DashboardSummary";
import { RehabRepository } from "../../domain/RehabRepository";
import { GetDashboardUseCase } from "../../application/GetDashboardUseCase";
import { NoRecoveryPlansError } from "../../infrastructure/HttpRehabRepository";

export function useDashboard(repository: RehabRepository) {
  const [dashboards, setDashboards] = useState<DashboardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      setIsEmpty(false);
    });

    const getDashboard = new GetDashboardUseCase(repository);
    getDashboard
      .execute()
      .then((fetched) => {
        if (!cancelled) setDashboards(fetched);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof NoRecoveryPlansError) {
          setIsEmpty(true);
          return;
        }
        setError(err instanceof Error ? err.message : "Error al cargar dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return { dashboards, loading, error, isEmpty };
}
