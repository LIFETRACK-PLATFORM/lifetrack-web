import { useCallback, useEffect, useState } from "react";
import { DashboardSummary } from "../../domain/DashboardSummary";
import {
  InactivePlanSummary,
  RecoveryPlanStatus,
  RehabRepository,
} from "../../domain/RehabRepository";
import { GetDashboardUseCase } from "../../application/GetDashboardUseCase";
import { NoRecoveryPlansError } from "../../infrastructure/HttpRehabRepository";

export function useDashboard(repository: RehabRepository) {
  const [dashboards, setDashboards] = useState<DashboardSummary[]>([]);
  const [inactivePlans, setInactivePlans] = useState<InactivePlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingPlanId, setActingPlanId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setIsEmpty(false);
      setActionError(null);

      const getDashboard = new GetDashboardUseCase(repository);
      try {
        const bundle = await getDashboard.execute();
        if (cancelled) return;
        setDashboards(bundle.active);
        setInactivePlans(bundle.inactive);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof NoRecoveryPlansError) {
          setDashboards([]);
          setInactivePlans([]);
          setIsEmpty(true);
          return;
        }
        setError(
          err instanceof Error ? err.message : "Error al cargar dashboard",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [repository, reloadToken]);

  const reactivatePlan = useCallback(
    async (planId: string) => {
      setActingPlanId(planId);
      setActionError(null);
      try {
        await repository.updatePlanStatus(planId, "ACTIVE");
        reload();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "No se pudo reactivar el plan",
        );
      } finally {
        setActingPlanId(null);
      }
    },
    [repository, reload],
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      setActingPlanId(planId);
      setActionError(null);
      try {
        await repository.deletePlan(planId);
        reload();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "No se pudo eliminar el plan",
        );
      } finally {
        setActingPlanId(null);
      }
    },
    [repository, reload],
  );

  return {
    dashboards,
    inactivePlans,
    loading,
    error,
    isEmpty,
    actionError,
    actingPlanId,
    reactivatePlan,
    deletePlan,
    reload,
  };
}

export type { RecoveryPlanStatus };
