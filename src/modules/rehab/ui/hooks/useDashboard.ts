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

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsEmpty(false);
    setActionError(null);

    const getDashboard = new GetDashboardUseCase(repository);
    try {
      const bundle = await getDashboard.execute();
      setDashboards(bundle.active);
      setInactivePlans(bundle.inactive);
    } catch (err) {
      if (err instanceof NoRecoveryPlansError) {
        setDashboards([]);
        setInactivePlans([]);
        setIsEmpty(true);
        return;
      }
      setError(err instanceof Error ? err.message : "Error al cargar dashboard");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const reactivatePlan = useCallback(
    async (planId: string) => {
      setActingPlanId(planId);
      setActionError(null);
      try {
        await repository.updatePlanStatus(planId, "ACTIVE");
        await reload();
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
        await reload();
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
