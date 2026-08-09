import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RehabPlan } from "../../domain/RehabPlan";
import {
  isSameWeek,
  shiftWeekIso,
  startOfWeekIso,
  todayDateIso,
} from "../../domain/protocolSchedule";
import {
  AddAppointmentInput,
  AddExerciseInput,
  AddMeasurementInput,
  AddPainLogInput,
  RecoveryPlanStatus,
  RehabRepository,
  UpdateExerciseInput,
  UpdateMeasurementInput,
} from "../../domain/RehabRepository";
import { GetPlanUseCase } from "../../application/GetPlanUseCase";
import { UpdateExerciseProgressUseCase } from "../../application/UpdateExerciseProgressUseCase";
import { AddExerciseUseCase } from "../../application/AddExerciseUseCase";
import { DeleteExerciseUseCase } from "../../application/DeleteExerciseUseCase";
import { UpdateExerciseUseCase } from "../../application/UpdateExerciseUseCase";
import { MarkExerciseCompletionUseCase } from "../../application/MarkExerciseCompletionUseCase";
import { UpdateRecoveryPlanStatusUseCase } from "../../application/UpdateRecoveryPlanStatusUseCase";
import { AddAppointmentUseCase } from "../../application/AddAppointmentUseCase";
import { UpdateAppointmentUseCase } from "../../application/UpdateAppointmentUseCase";
import { DeleteAppointmentUseCase } from "../../application/DeleteAppointmentUseCase";
import { MarkAppointmentAttendanceUseCase } from "../../application/MarkAppointmentAttendanceUseCase";
import { AddPainLogUseCase } from "../../application/AddPainLogUseCase";
import { AddMeasurementUseCase } from "../../application/AddMeasurementUseCase";
import { UpdateMeasurementUseCase } from "../../application/UpdateMeasurementUseCase";
import { DeleteMeasurementUseCase } from "../../application/DeleteMeasurementUseCase";
import { SetAdHocProtocolDayUseCase } from "../../application/SetAdHocProtocolDayUseCase";
import { ClearAdHocProtocolDayUseCase } from "../../application/ClearAdHocProtocolDayUseCase";
import { RehabApiError } from "../../infrastructure/http/rehabHttpClient";

export function usePlan(repository: RehabRepository, planId: string) {
  const [plan, setPlan] = useState<RehabPlan | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [weekReferenceDate, setWeekReferenceDate] = useState(() => todayDateIso());
  const hasLoadedOnceRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [addExerciseError, setAddExerciseError] = useState<string | null>(null);
  const [addingExercise, setAddingExercise] = useState(false);
  const [updatingExercise, setUpdatingExercise] = useState(false);
  const [updateExerciseError, setUpdateExerciseError] = useState<string | null>(
    null,
  );
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
  const [updatingAppointment, setUpdatingAppointment] = useState(false);
  const [updateAppointmentError, setUpdateAppointmentError] = useState<
    string | null
  >(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<
    string | null
  >(null);
  const [deleteAppointmentError, setDeleteAppointmentError] = useState<
    string | null
  >(null);
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
  const [updateMeasurementError, setUpdateMeasurementError] = useState<
    string | null
  >(null);
  const [updatingMeasurement, setUpdatingMeasurement] = useState(false);
  const [deleteMeasurementError, setDeleteMeasurementError] = useState<
    string | null
  >(null);
  const [deletingMeasurementId, setDeletingMeasurementId] = useState<
    string | null
  >(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateStatusError, setUpdateStatusError] = useState<string | null>(
    null,
  );
  const [adHocProtocolError, setAdHocProtocolError] = useState<string | null>(
    null,
  );
  const [savingAdHocProtocol, setSavingAdHocProtocol] = useState(false);

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
    const refreshed = await getPlan.execute(planId, { weekReferenceDate });
    applyPlan(refreshed);
  }, [repository, planId, applyPlan, weekReferenceDate]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (hasLoadedOnceRef.current) {
        setLoadingWeek(true);
      } else {
        setLoading(true);
      }
      setError(null);
      setNotFound(false);
    });

    const getPlan = new GetPlanUseCase(repository);
    getPlan
      .execute(planId, { weekReferenceDate })
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
        if (!cancelled) {
          setLoading(false);
          setLoadingWeek(false);
          hasLoadedOnceRef.current = true;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [repository, planId, weekReferenceDate, applyPlan]);

  const todayIso = useMemo(() => todayDateIso(), []);
  const canGoToNextWeek = useMemo(
    () => startOfWeekIso(weekReferenceDate) < startOfWeekIso(todayIso),
    [weekReferenceDate, todayIso],
  );
  const isViewingCurrentWeek = useMemo(
    () => isSameWeek(weekReferenceDate, todayIso),
    [weekReferenceDate, todayIso],
  );

  const goToPreviousWeek = useCallback(() => {
    setWeekReferenceDate((current) => shiftWeekIso(current, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekReferenceDate((current) => {
      const next = shiftWeekIso(current, 1);
      if (startOfWeekIso(next) > startOfWeekIso(todayIso)) {
        return current;
      }
      return next;
    });
  }, [todayIso]);

  const goToCurrentWeek = useCallback(() => {
    setWeekReferenceDate(todayIso);
  }, [todayIso]);

  const ADJUST_DEBOUNCE_MS = 500;
  const pendingProgressRef = useRef<Record<string, number>>({});
  const progressTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  const commitProgress = useCallback(
    async (exerciseId: string) => {
      const value = pendingProgressRef.current[exerciseId];
      delete pendingProgressRef.current[exerciseId];
      delete progressTimersRef.current[exerciseId];
      if (value === undefined || !plan) return;

      try {
        const useCase = new UpdateExerciseProgressUseCase(repository);
        await useCase.execute(plan.id, exerciseId, value);
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "No se pudo guardar progreso",
        );
      }
    },
    [plan, repository],
  );

  useEffect(() => {
    const timers = progressTimersRef.current;
    return () => {
      // Al desmontar, tira los timers pendientes en vez de dejarlos disparar
      // sobre un componente ya desmontado.
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Cada tap actualiza el contador al toque (optimista) pero solo se manda
  // el request a la API 500ms despues del ultimo tap, para no pegarle a la
  // API una vez por cada click si el usuario toca varias veces seguidas.
  const adjust = useCallback(
    (exerciseId: string, delta: number, target: number) => {
      if (!plan) return;
      setSaveError(null);
      setCounts((current) => {
        const prev = current[exerciseId] ?? 0;
        const next = Math.max(0, Math.min(target, prev + delta));

        pendingProgressRef.current[exerciseId] = next;
        if (progressTimersRef.current[exerciseId]) {
          clearTimeout(progressTimersRef.current[exerciseId]);
        }
        progressTimersRef.current[exerciseId] = setTimeout(() => {
          void commitProgress(exerciseId);
        }, ADJUST_DEBOUNCE_MS);

        return { ...current, [exerciseId]: next };
      });
    },
    [plan, commitProgress],
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

  const updateExercise = useCallback(
    async (exerciseId: string, input: UpdateExerciseInput) => {
      if (!plan) return false;
      setUpdatingExercise(true);
      setUpdateExerciseError(null);

      try {
        const useCase = new UpdateExerciseUseCase(repository);
        await useCase.execute(plan.id, exerciseId, input);
        await refresh();
        return true;
      } catch (err) {
        setUpdateExerciseError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el ejercicio",
        );
        return false;
      } finally {
        setUpdatingExercise(false);
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
    async (exerciseId: string, completed: boolean, date?: string) => {
      if (!plan) return;
      const targetDate = date ?? new Date().toISOString().slice(0, 10);
      setCompletionError(null);
      setPendingCompletionIds((current) => new Set(current).add(exerciseId));

      try {
        const useCase = new MarkExerciseCompletionUseCase(repository);
        await useCase.execute(exerciseId, targetDate, completed);
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

  const updateAppointment = useCallback(
    async (appointmentId: string, input: AddAppointmentInput) => {
      if (!plan) return false;
      setUpdatingAppointment(true);
      setUpdateAppointmentError(null);

      try {
        const useCase = new UpdateAppointmentUseCase(repository);
        await useCase.execute(appointmentId, input);
        await refresh();
        return true;
      } catch (err) {
        setUpdateAppointmentError(
          err instanceof Error ? err.message : "No se pudo actualizar la cita",
        );
        return false;
      } finally {
        setUpdatingAppointment(false);
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

  const deleteAppointment = useCallback(
    async (appointmentId: string) => {
      if (!plan) return false;
      setDeletingAppointmentId(appointmentId);
      setDeleteAppointmentError(null);

      try {
        const useCase = new DeleteAppointmentUseCase(repository);
        await useCase.execute(plan.id, appointmentId);
        await refresh();
        return true;
      } catch (err) {
        setDeleteAppointmentError(
          err instanceof Error ? err.message : "No se pudo eliminar la cita",
        );
        return false;
      } finally {
        setDeletingAppointmentId(null);
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

  const updateMeasurement = useCallback(
    async (measurementId: string, input: UpdateMeasurementInput) => {
      setUpdatingMeasurement(true);
      setUpdateMeasurementError(null);

      try {
        const useCase = new UpdateMeasurementUseCase(repository);
        await useCase.execute(measurementId, input);
        await refresh();
        return true;
      } catch (err) {
        setUpdateMeasurementError(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar la medición",
        );
        return false;
      } finally {
        setUpdatingMeasurement(false);
      }
    },
    [repository, refresh],
  );

  const deleteMeasurement = useCallback(
    async (measurementId: string) => {
      setDeletingMeasurementId(measurementId);
      setDeleteMeasurementError(null);

      try {
        const useCase = new DeleteMeasurementUseCase(repository);
        await useCase.execute(measurementId);
        await refresh();
        return true;
      } catch (err) {
        setDeleteMeasurementError(
          err instanceof Error
            ? err.message
            : "No se pudo eliminar la medición",
        );
        return false;
      } finally {
        setDeletingMeasurementId(null);
      }
    },
    [repository, refresh],
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

  const setAdHocProtocolDay = useCallback(
    async (targetDate: string, sourceDate: string) => {
      if (!plan) return false;
      setSavingAdHocProtocol(true);
      setAdHocProtocolError(null);

      try {
        const useCase = new SetAdHocProtocolDayUseCase(repository);
        await useCase.execute(plan.id, targetDate, sourceDate);
        await refresh();
        return true;
      } catch (err) {
        setAdHocProtocolError(
          err instanceof Error
            ? err.message
            : "No se pudo guardar la rutina prestada",
        );
        return false;
      } finally {
        setSavingAdHocProtocol(false);
      }
    },
    [plan, repository, refresh],
  );

  const clearAdHocProtocolDay = useCallback(
    async (targetDate: string) => {
      if (!plan) return false;
      setSavingAdHocProtocol(true);
      setAdHocProtocolError(null);

      try {
        const useCase = new ClearAdHocProtocolDayUseCase(repository);
        await useCase.execute(plan.id, targetDate);
        await refresh();
        return true;
      } catch (err) {
        setAdHocProtocolError(
          err instanceof Error
            ? err.message
            : "No se pudo quitar la rutina prestada",
        );
        return false;
      } finally {
        setSavingAdHocProtocol(false);
      }
    },
    [plan, repository, refresh],
  );

  return {
    plan,
    counts,
    adjust,
    loading,
    loadingWeek,
    weekReferenceDate,
    weekStart: plan?.weekStart,
    weekEnd: plan?.weekEnd,
    canGoToNextWeek,
    isViewingCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    error,
    notFound,
    saveError,
    addExercise,
    addingExercise,
    addExerciseError,
    updateExercise,
    updatingExercise,
    updateExerciseError,
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
    updateAppointment,
    updatingAppointment,
    updateAppointmentError,
    deleteAppointment,
    deletingAppointmentId,
    deleteAppointmentError,
    markAppointmentAttendance,
    attendanceError,
    pendingAttendanceIds,
    addPainLog,
    addingPainLog,
    addPainLogError,
    addMeasurement,
    addingMeasurement,
    addMeasurementError,
    updateMeasurement,
    updatingMeasurement,
    updateMeasurementError,
    deleteMeasurement,
    deletingMeasurementId,
    deleteMeasurementError,
    setAdHocProtocolDay,
    clearAdHocProtocolDay,
    savingAdHocProtocol,
    adHocProtocolError,
  };
}
