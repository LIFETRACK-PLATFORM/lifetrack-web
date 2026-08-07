import { useCallback, useEffect, useState } from "react";
import { RehabPlan } from "../../domain/RehabPlan";
import {
  AddAppointmentInput,
  AddExerciseInput,
  AddMeasurementInput,
  AddPainLogInput,
  RecoveryPlanStatus,
  RehabRepository,
} from "../../domain/RehabRepository";
import { GetPlanUseCase } from "../../application/GetPlanUseCase";
import { UpdateExerciseProgressUseCase } from "../../application/UpdateExerciseProgressUseCase";
import { AddExerciseUseCase } from "../../application/AddExerciseUseCase";
import { DeleteExerciseUseCase } from "../../application/DeleteExerciseUseCase";
import { MarkExerciseCompletionUseCase } from "../../application/MarkExerciseCompletionUseCase";
import { UpdateRecoveryPlanStatusUseCase } from "../../application/UpdateRecoveryPlanStatusUseCase";
import { AddAppointmentUseCase } from "../../application/AddAppointmentUseCase";
import { MarkAppointmentAttendanceUseCase } from "../../application/MarkAppointmentAttendanceUseCase";
import { AddPainLogUseCase } from "../../application/AddPainLogUseCase";
import { AddMeasurementUseCase } from "../../application/AddMeasurementUseCase";
import { RehabApiError } from "../../infrastructure/http/rehabHttpClient";

export function usePlan(repository: RehabRepository, planId: string) {
  const [plan, setPlan] = useState<RehabPlan | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [addExerciseError, setAddExerciseError] = useState<string | null>(null);
  const [addingExercise, setAddingExercise] = useState(false);
  const [deleteExerciseError, setDeleteExerciseError] = useState<string | null>(
    null,
  );
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(
    null,
  );
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [pendingCompletionIds, setPendingCompletionIds] = useState<Set<string>>(
    new Set(),
  );
  const [addAppointmentError, setAddAppointmentError] = useState<string | null>(
    null,
  );
  const [addingAppointment, setAddingAppointment] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [pendingAttendanceIds, setPendingAttendanceIds] = useState<Set<string>>(
    new Set(),
  );
  const [addPainLogError, setAddPainLogError] = useState<string | null>(null);
  const [addingPainLog, setAddingPainLog] = useState(false);
  const [addMeasurementError, setAddMeasurementError] = useState<string | null>(
    null,
  );
  const [addingMeasurement, setAddingMeasurement] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateStatusError, setUpdateStatusError] = useState<string | null>(
    null,
  );

  const applyPlan = useCallback((fetched: RehabPlan) => {
    setPlan(fetched);
    const initial: Record<string, number> = {};
    for (const exercise of fetched.exercises) {
      initial[exercise.id] = exercise.current;
    }
    setCounts(initial);
  }, []);

  const refresh = useCallback(async () => {
    const getPlan = new GetPlanUseCase(repository);
    const refreshed = await getPlan.execute(planId);
    applyPlan(refreshed);
  }, [repository, planId, applyPlan]);

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
        applyPlan(fetched);
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
  }, [repository, planId, applyPlan]);

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

  const addExercise = useCallback(
    async (input: AddExerciseInput) => {
      if (!plan) return false;
      setAddingExercise(true);
      setAddExerciseError(null);

      try {
        const useCase = new AddExerciseUseCase(repository);
        await useCase.execute(plan.id, input);
        await refresh();
        return true;
      } catch (err) {
        setAddExerciseError(
          err instanceof Error ? err.message : "No se pudo agregar el ejercicio",
        );
        return false;
      } finally {
        setAddingExercise(false);
      }
    },
    [plan, repository, refresh],
  );

  const deleteExercise = useCallback(
    async (exerciseId: string) => {
      if (!plan) return false;
      setDeletingExerciseId(exerciseId);
      setDeleteExerciseError(null);

      try {
        const useCase = new DeleteExerciseUseCase(repository);
        await useCase.execute(plan.id, exerciseId);
        await refresh();
        return true;
      } catch (err) {
        setDeleteExerciseError(
          err instanceof Error
            ? err.message
            : "No se pudo eliminar el ejercicio",
        );
        return false;
      } finally {
        setDeletingExerciseId(null);
      }
    },
    [plan, repository, refresh],
  );

  const toggleExerciseCompletion = useCallback(
    async (exerciseId: string, completed: boolean) => {
      if (!plan) return;
      const today = new Date().toISOString().slice(0, 10);
      setCompletionError(null);
      setPendingCompletionIds((current) => new Set(current).add(exerciseId));

      try {
        const useCase = new MarkExerciseCompletionUseCase(repository);
        await useCase.execute(exerciseId, today, completed);
        await refresh();
      } catch (err) {
        setCompletionError(
          err instanceof Error ? err.message : "No se pudo actualizar el ejercicio",
        );
      } finally {
        setPendingCompletionIds((current) => {
          const next = new Set(current);
          next.delete(exerciseId);
          return next;
        });
      }
    },
    [plan, repository, refresh],
  );

  const addAppointment = useCallback(
    async (input: AddAppointmentInput) => {
      if (!plan) return false;
      setAddingAppointment(true);
      setAddAppointmentError(null);

      try {
        const useCase = new AddAppointmentUseCase(repository);
        await useCase.execute(plan.id, input);
        await refresh();
        return true;
      } catch (err) {
        setAddAppointmentError(
          err instanceof Error ? err.message : "No se pudo agregar la cita",
        );
        return false;
      } finally {
        setAddingAppointment(false);
      }
    },
    [plan, repository, refresh],
  );

  const markAppointmentAttendance = useCallback(
    async (appointmentId: string, attended: boolean) => {
      if (!plan) return;
      setAttendanceError(null);
      setPendingAttendanceIds((current) =>
        new Set(current).add(appointmentId),
      );

      try {
        const useCase = new MarkAppointmentAttendanceUseCase(repository);
        await useCase.execute(appointmentId, attended);
        await refresh();
      } catch (err) {
        setAttendanceError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar la asistencia",
        );
      } finally {
        setPendingAttendanceIds((current) => {
          const next = new Set(current);
          next.delete(appointmentId);
          return next;
        });
      }
    },
    [plan, repository, refresh],
  );

  const addPainLog = useCallback(
    async (input: AddPainLogInput) => {
      if (!plan) return false;
      setAddingPainLog(true);
      setAddPainLogError(null);

      try {
        const useCase = new AddPainLogUseCase(repository);
        await useCase.execute(plan.id, input);
        await refresh();
        return true;
      } catch (err) {
        setAddPainLogError(
          err instanceof Error ? err.message : "No se pudo registrar el dolor",
        );
        return false;
      } finally {
        setAddingPainLog(false);
      }
    },
    [plan, repository, refresh],
  );

  const addMeasurement = useCallback(
    async (input: AddMeasurementInput) => {
      if (!plan) return false;
      setAddingMeasurement(true);
      setAddMeasurementError(null);

      try {
        const useCase = new AddMeasurementUseCase(repository);
        await useCase.execute(plan.id, input);
        await refresh();
        return true;
      } catch (err) {
        setAddMeasurementError(
          err instanceof Error
            ? err.message
            : "No se pudo registrar la medición",
        );
        return false;
      } finally {
        setAddingMeasurement(false);
      }
    },
    [plan, repository, refresh],
  );

  const updateStatus = useCallback(
    async (status: RecoveryPlanStatus) => {
      if (!plan) return false;
      setUpdatingStatus(true);
      setUpdateStatusError(null);

      try {
        const useCase = new UpdateRecoveryPlanStatusUseCase(repository);
        await useCase.execute(plan.id, status);
        await refresh();
        return true;
      } catch (err) {
        setUpdateStatusError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el estado del plan",
        );
        return false;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [plan, repository, refresh],
  );

  return {
    plan,
    counts,
    adjust,
    loading,
    error,
    notFound,
    saveError,
    addExercise,
    addingExercise,
    addExerciseError,
    deleteExercise,
    deletingExerciseId,
    deleteExerciseError,
    toggleExerciseCompletion,
    completionError,
    pendingCompletionIds,
    updateStatus,
    updatingStatus,
    updateStatusError,
    addAppointment,
    addingAppointment,
    addAppointmentError,
    markAppointmentAttendance,
    attendanceError,
    pendingAttendanceIds,
    addPainLog,
    addingPainLog,
    addPainLogError,
    addMeasurement,
    addingMeasurement,
    addMeasurementError,
  };
}
