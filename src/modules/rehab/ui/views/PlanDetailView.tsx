"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/shared/ui/Icon";
import { ExerciseCard } from "@/modules/rehab/ui/components/ExerciseCard";
import { ExerciseFormDialog } from "@/modules/rehab/ui/components/ExerciseFormDialog";
import { AddAppointmentDialog } from "@/modules/rehab/ui/components/AddAppointmentDialog";
import { createRehabRepository } from "@/modules/rehab/infrastructure/createRehabRepository";
import { RehabRepository } from "@/modules/rehab/domain/RehabRepository";
import { Exercise } from "@/modules/rehab/domain/Exercise";
import { Appointment } from "@/modules/rehab/domain/Appointment";
import { usePlan } from "@/modules/rehab/ui/hooks/usePlan";
import { exerciseDomId } from "@/modules/rehab/ui/rehabRoutes";
import type { RecoveryPlanStatus } from "@/modules/rehab/domain/RehabRepository";
import type { PainLogPoint } from "@/modules/rehab/domain/RehabPlan";
import type { StatusBadgeStatus } from "@/components/ui/badge";
import { useAuthenticatedUser } from "@/modules/auth/ui/context/AuthenticatedUserContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=LT";

type Tab = "exercises" | "appointments" | "metrics" | "photos";

export function PlanDetailView({
  repository,
  planId,
}: {
  repository?: RehabRepository;
  planId: string;
}) {
  const [tab, setTab] = useState<Tab>("exercises");
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [painLevel, setPainLevel] = useState("3");
  const [painNote, setPainNote] = useState("");
  const [extensionDegrees, setExtensionDegrees] = useState("");
  const activeRepository = useMemo(
    () => repository ?? createRehabRepository(),
    [repository],
  );
  const authUser = useAuthenticatedUser();
  const {
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
  } = usePlan(activeRepository, planId);

  const router = useRouter();
  const searchParams = useSearchParams();
  const focusExerciseId = searchParams.get("exercise");
  const [highlightExerciseId, setHighlightExerciseId] = useState<string | null>(
    null,
  );
  const focusedExerciseRef = useRef(false);

  useEffect(() => {
    if (!plan || loading || !focusExerciseId || focusedExerciseRef.current) {
      return;
    }

    const exists = plan.exercises.some((exercise) => exercise.id === focusExerciseId);
    if (!exists) {
      router.replace(`/rehab/plans/${planId}`, { scroll: false });
      return;
    }

    focusedExerciseRef.current = true;

    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById(exerciseDomId(focusExerciseId))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightExerciseId(focusExerciseId);
      router.replace(`/rehab/plans/${planId}`, { scroll: false });
    }, 150);

    const highlightTimer = window.setTimeout(() => {
      setHighlightExerciseId(null);
    }, 2500);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(highlightTimer);
    };
  }, [plan, loading, focusExerciseId, planId, router]);

  const handleAddPainLog = async () => {
    const level = Number(painLevel);
    if (!Number.isInteger(level) || level < 0 || level > 10) return;
    const success = await addPainLog({
      date: new Date().toISOString(),
      level,
      note: painNote.trim() || undefined,
    });
    if (success) setPainNote("");
  };

  const handleAddExtension = async () => {
    const value = Number(extensionDegrees);
    if (!Number.isFinite(value)) return;
    const success = await addMeasurement({
      type: "EXTENSION_DEGREES",
      value,
      unit: "°",
      date: new Date().toISOString(),
    });
    if (success) setExtensionDegrees("");
  };

  if (loading) {
    return <PlanDetailSkeleton />;
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <h2 className="text-headline-md">Plan no encontrado</h2>
        <Link href="/rehab" className="text-primary underline">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-error">{error ?? "Error desconocido"}</p>
        <Link href="/rehab" className="text-primary underline">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const displayName = authUser.email.split("@")[0] ?? authUser.email;

  const tabsMobile: { id: Tab; label: string }[] = [
    { id: "exercises", label: "Ejercicios" },
    { id: "appointments", label: "Citas" },
    { id: "metrics", label: "Métricas" },
  ];

  const tabsWeb: { id: Tab; label: string }[] = [
    { id: "exercises", label: "Ejercicios" },
    { id: "appointments", label: "Citas" },
    { id: "metrics", label: "Mediciones" },
    { id: "photos", label: "Fotos" },
  ];

  return (
    <>
      {/* Mobile */}
      <div className="flex min-h-screen flex-col bg-background text-text-1 md:hidden">
        <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-surface/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/rehab"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface-2 active:scale-90"
            >
              <Icon name="arrow_back" className="text-primary" />
            </Link>
            <h1 className="text-headline-md font-bold text-primary">Rehabilitación</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-3"
            >
              <Icon name="notifications" />
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-border">
              <Image
                src={DEFAULT_AVATAR}
                alt={displayName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pb-32 pt-4">
          <section className="mb-10">
            <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground ">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/10 blur-2xl" />
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-white/20 px-2 py-1 font-label text-label-md uppercase tracking-wider">
                  {plan.phaseLabel}
                </span>
                <StatusBadge
                  status={toBadgeStatus(plan.status)}
                  className="bg-white/10 text-primary-foreground [&_span]:bg-success"
                />
              </div>
              <h2 className="text-headline-lg-mobile font-bold">
                {plan.titleMobile}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <Icon name="verified" className="text-[20px]" />
                <p className="text-body-md opacity-90">{plan.statusMessage}</p>
              </div>
            </div>
          </section>
          <section className="mb-10">
            <PlanStatusControl
              status={plan.status}
              updating={updatingStatus}
              onChangeStatus={updateStatus}
            />
            {updateStatusError && (
              <p className="mt-2 text-body-md text-error">{updateStatusError}</p>
            )}
          </section>

          <div className="sticky top-[72px] z-30 mb-6 flex gap-2 overflow-x-auto bg-background/95 py-2 no-scrollbar">
            {tabsMobile.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-6 py-2 font-label text-label-md transition-all ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-text-3"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "exercises" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-headline-md font-semibold text-text-1">
                  Protocolo de hoy
                </h3>
                <span className="font-label text-label-md text-primary">
                  Quedan {plan.remainingToday}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExerciseOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 py-3 font-label text-label-md text-primary transition-all active:scale-95"
              >
                <Icon name="add" className="text-[20px]" />
                Agregar ejercicio
              </button>
              {plan.exercises
                .filter((e) => e.id !== "glute")
                .map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    current={counts[ex.id] ?? 0}
                    highlighted={highlightExerciseId === ex.id}
                    pendingCompletion={pendingCompletionIds.has(ex.id)}
                    deleting={deletingExerciseId === ex.id}
                    showMedia={false}
                    onAdjust={(delta) => adjust(ex.id, delta, ex.target)}
                    onToggleCompletion={(date) =>
                      toggleExerciseCompletion(
                        ex.id,
                        date ? true : !ex.completedToday,
                        date,
                      )
                    }
                    onEdit={() => setEditingExercise(ex)}
                    onDelete={() => void deleteExercise(ex.id)}
                  />
                ))}
              {saveError && (
                <p className="text-body-md text-error">{saveError}</p>
              )}
              {updateExerciseError && (
                <p className="text-body-md text-error">{updateExerciseError}</p>
              )}
              {completionError && (
                <p className="text-body-md text-error">{completionError}</p>
              )}
              {deleteExerciseError && (
                <p className="text-body-md text-error">{deleteExerciseError}</p>
              )}
              <PainLogForm
                painLevel={painLevel}
                setPainLevel={setPainLevel}
                painNote={painNote}
                setPainNote={setPainNote}
                onSubmit={handleAddPainLog}
                submitting={addingPainLog}
                error={addPainLogError}
              />
            </div>
          )}

          {tab === "appointments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-headline-md font-semibold text-text-1">
                  Próximas sesiones
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAppointmentOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 py-3 font-label text-label-md text-primary transition-all active:scale-95"
              >
                <Icon name="add" className="text-[20px]" />
                Agregar cita
              </button>
              {plan.appointments.map((apt) => (
                <AppointmentListItem
                  key={apt.id}
                  apt={apt}
                  pendingAttendance={pendingAttendanceIds.has(apt.id)}
                  deleting={deletingAppointmentId === apt.id}
                  onMarkAttendance={(attended) =>
                    void markAppointmentAttendance(apt.id, attended)
                  }
                  onEdit={() => setEditingAppointment(apt)}
                  onDelete={() => void deleteAppointment(apt.id)}
                />
              ))}
              {attendanceError && (
                <p className="text-body-md text-error">{attendanceError}</p>
              )}
              {deleteAppointmentError && (
                <p className="text-body-md text-error">{deleteAppointmentError}</p>
              )}
              <PainLogForm
                painLevel={painLevel}
                setPainLevel={setPainLevel}
                painNote={painNote}
                setPainNote={setPainNote}
                onSubmit={handleAddPainLog}
                submitting={addingPainLog}
                error={addPainLogError}
              />
            </div>
          )}

          {tab === "metrics" && (
            <div className="space-y-4">
              <h3 className="px-1 text-headline-md font-semibold text-text-1">
                Indicadores de recuperación
              </h3>
              <div className="rounded-xl border border-border bg-surface-1 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-label text-label-md text-text-3">
                    Rango de extensión de rodilla
                  </span>
                  <span className="font-bold text-primary">
                    {plan.metrics.kneeExtensionNote}
                  </span>
                </div>
                <div className="flex h-32 items-end gap-2">
                  <div className="h-1/4 flex-1 rounded-t-sm bg-surface-3" />
                  <div className="h-2/4 flex-1 rounded-t-sm bg-surface-3" />
                  <div className="h-3/4 flex-1 rounded-t-sm bg-surface-3" />
                  <div className="h-full flex-1 rounded-t-sm bg-primary" />
                </div>
              </div>
              <ExtensionForm
                value={extensionDegrees}
                setValue={setExtensionDegrees}
                onSubmit={handleAddExtension}
                submitting={addingMeasurement}
                error={addMeasurementError}
              />
              <PainHistoryCard
                painLevel={plan.metrics.painLevel}
                history={plan.painHistory}
              />
              <PainLogForm
                painLevel={painLevel}
                setPainLevel={setPainLevel}
                painNote={painNote}
                setPainNote={setPainNote}
                onSubmit={handleAddPainLog}
                submitting={addingPainLog}
                error={addPainLogError}
              />
            </div>
          )}
        </main>

        <Link
          href="/rehab"
          className="fixed bottom-24 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground  transition-transform active:scale-90"
        >
          <Icon name="add" className="text-[32px]" />
        </Link>
      </div>

      {/* Web */}
      <div className="hidden min-h-screen bg-background text-text-1 md:block">
        <main className="min-h-screen">
          <header className="sticky top-0 z-40 mx-auto flex w-full max-w-app items-center justify-between bg-surface px-6 py-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-headline-md font-bold text-primary">
                  {plan.titleWeb}
                </h2>
                <StatusBadge status={toBadgeStatus(plan.status)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <p className="font-label text-label-md text-text-3">
                  {plan.weekLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PlanStatusControl
                status={plan.status}
                updating={updatingStatus}
                onChangeStatus={updateStatus}
              />
              <div className="hidden items-center rounded-full border border-border/30 bg-surface-1 px-4 py-1 sm:flex">
                <Icon name="search" className="mr-2 text-text-3" />
                <Input
                  className="h-8 w-48 border-none bg-transparent shadow-none focus-visible:ring-0"
                  placeholder="Buscar ejercicios..."
                  type="search"
                />
              </div>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-surface-3"
              >
                <Icon name="notifications" />
              </button>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-surface-3"
              >
                <Icon name="settings" />
              </button>
            </div>
          </header>

          {updateStatusError && (
            <p className="mx-auto max-w-app px-6 pt-2 text-body-md text-error">
              {updateStatusError}
            </p>
          )}

          <div className="mt-4 px-6">
            <div className="flex items-center gap-10 border-b border-border/20">
              {tabsWeb.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`pb-4 font-label text-label-md transition-colors ${
                    tab === t.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-3 hover:text-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 p-6 lg:flex-row">
            <section className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-headline-md text-text-1">
                  Protocolo de hoy
                </h3>
                <div className="flex gap-2">
                  {tab === "exercises" && (
                    <button
                      type="button"
                      onClick={() => setIsAddExerciseOpen(true)}
                      className="flex items-center gap-1 rounded-lg border border-primary/40 px-4 py-2 font-label text-label-md text-primary transition-all active:scale-95"
                    >
                      <Icon name="add" className="text-[20px]" />
                      Agregar ejercicio
                    </button>
                  )}
                </div>
              </div>

              {(tab === "exercises" || tab === "photos") && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {plan.exercises.map((ex) => (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
                      current={counts[ex.id] ?? 0}
                      highlighted={highlightExerciseId === ex.id}
                      pendingCompletion={pendingCompletionIds.has(ex.id)}
                      deleting={deletingExerciseId === ex.id}
                      showMedia
                      onAdjust={(delta) => adjust(ex.id, delta, ex.target)}
                      onToggleCompletion={(date) =>
                        toggleExerciseCompletion(
                          ex.id,
                          date ? true : !ex.completedToday,
                          date,
                        )
                      }
                      onEdit={() => setEditingExercise(ex)}
                      onDelete={() => void deleteExercise(ex.id)}
                    />
                  ))}
                  {saveError && (
                    <p className="col-span-full text-body-md text-error">
                      {saveError}
                    </p>
                  )}
                  {updateExerciseError && (
                    <p className="col-span-full text-body-md text-error">
                      {updateExerciseError}
                    </p>
                  )}
                </div>
              )}

              {(tab === "exercises" || tab === "photos") && (
                <div className="mt-2">
                  <PainLogForm
                    painLevel={painLevel}
                    setPainLevel={setPainLevel}
                    painNote={painNote}
                    setPainNote={setPainNote}
                    onSubmit={handleAddPainLog}
                    submitting={addingPainLog}
                    error={addPainLogError}
                  />
                </div>
              )}

              {tab === "appointments" && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setIsAddAppointmentOpen(true)}
                    className="flex items-center gap-1 rounded-lg border border-primary/40 px-4 py-2 font-label text-label-md text-primary transition-all active:scale-95"
                  >
                    <Icon name="add" className="text-[20px]" />
                    Agregar cita
                  </button>
                  {plan.appointments.map((apt) => (
                    <AppointmentListItem
                      key={apt.id}
                      apt={apt}
                      pendingAttendance={pendingAttendanceIds.has(apt.id)}
                      deleting={deletingAppointmentId === apt.id}
                      onMarkAttendance={(attended) =>
                        void markAppointmentAttendance(apt.id, attended)
                      }
                      onEdit={() => setEditingAppointment(apt)}
                      onDelete={() => void deleteAppointment(apt.id)}
                    />
                  ))}
                  {attendanceError && (
                    <p className="text-body-md text-error">{attendanceError}</p>
                  )}
                  {deleteAppointmentError && (
                    <p className="text-body-md text-error">
                      {deleteAppointmentError}
                    </p>
                  )}
                </div>
              )}

              {tab === "metrics" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border/30 bg-surface-1 p-6">
                    <div className="mb-4 flex justify-between">
                      <span className="font-label text-label-md text-text-3">
                        Rango de extensión de rodilla
                      </span>
                      <span className="font-bold text-primary">
                        {plan.metrics.kneeExtensionNote}
                      </span>
                    </div>
                    <div className="flex h-40 items-end gap-2">
                      <div className="h-1/4 flex-1 rounded-t-sm bg-surface-3" />
                      <div className="h-2/4 flex-1 rounded-t-sm bg-surface-3" />
                      <div className="h-3/4 flex-1 rounded-t-sm bg-surface-3" />
                      <div className="h-full flex-1 rounded-t-sm bg-primary" />
                    </div>
                  </div>
                  <PainHistoryCard
                    painLevel={plan.metrics.painLevel}
                    history={plan.painHistory}
                    className="border-border/30"
                  />
                  <div className="md:col-span-2 space-y-4">
                    <ExtensionForm
                      value={extensionDegrees}
                      setValue={setExtensionDegrees}
                      onSubmit={handleAddExtension}
                      submitting={addingMeasurement}
                      error={addMeasurementError}
                    />
                    <PainLogForm
                      painLevel={painLevel}
                      setPainLevel={setPainLevel}
                      painNote={painNote}
                      setPainNote={setPainNote}
                      onSubmit={handleAddPainLog}
                      submitting={addingPainLog}
                      error={addPainLogError}
                    />
                  </div>
                </div>
              )}
            </section>

            <aside className="w-full space-y-6 lg:w-[320px]">
              <div className="rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
                <h3 className="mb-4 text-headline-md">Estadísticas de sesión</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-label text-label-md text-text-3">
                      Completado hoy
                    </span>
                    <span className="font-bold text-primary">
                      {plan.completedTodayCount} / {plan.scheduledTodayCount}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${
                          plan.scheduledTodayCount === 0
                            ? 0
                            : Math.round(
                                (plan.completedTodayCount /
                                  plan.scheduledTodayCount) *
                                  100,
                              )
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="font-label text-label-md text-text-3">
                      Cumplimiento semanal
                    </span>
                    <span className="font-bold">{plan.weeklyCompliancePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-label text-label-md text-text-3">
                      Racha
                    </span>
                    <span className="font-bold">{plan.streakDays} días</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 p-6 text-text-1">
                <div className="mb-2 flex items-center gap-2">
                  <Icon name="calendar_today" filled />
                  <span className="font-label text-label-md font-bold">
                    Próxima cita
                  </span>
                </div>
                <p className="text-body-md">
                  {plan.appointments[0]?.title} —{" "}
                  {plan.appointments[0]?.detail}
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {isAddExerciseOpen && (
        <ExerciseFormDialog
          onClose={() => setIsAddExerciseOpen(false)}
          onSubmit={addExercise}
          submitting={addingExercise}
          error={addExerciseError}
        />
      )}
      {editingExercise && (
        <ExerciseFormDialog
          key={editingExercise.id}
          exerciseId={editingExercise.id}
          initial={{
            name: editingExercise.name,
            metricType: editingExercise.metricType,
            targetSets: editingExercise.sets,
            targetReps: editingExercise.reps,
            targetDurationMinutes:
              editingExercise.targetDurationMinutes ?? undefined,
            notes: editingExercise.notes ?? undefined,
            daysOfWeek: editingExercise.daysOfWeek,
          }}
          onClose={() => setEditingExercise(null)}
          onSubmit={(input) => updateExercise(editingExercise.id, input)}
          submitting={updatingExercise}
          error={updateExerciseError}
        />
      )}

      {isAddAppointmentOpen && (
        <AddAppointmentDialog
          onClose={() => setIsAddAppointmentOpen(false)}
          onSubmit={addAppointment}
          submitting={addingAppointment}
          error={addAppointmentError}
        />
      )}
      {editingAppointment && (
        <AddAppointmentDialog
          key={editingAppointment.id}
          appointmentId={editingAppointment.id}
          initial={{
            title: editingAppointment.title,
            date: editingAppointment.date,
            provider: editingAppointment.provider,
            type: editingAppointment.type,
            notes: editingAppointment.notes ?? undefined,
          }}
          onClose={() => setEditingAppointment(null)}
          onSubmit={(input) =>
            updateAppointment(editingAppointment.id, input)
          }
          submitting={updatingAppointment}
          error={updateAppointmentError}
        />
      )}
    </>
  );
}

function PlanDetailSkeleton() {
  return (
    <>
      {/* Mobile */}
      <div className="flex min-h-screen flex-col bg-background text-text-1 md:hidden">
        <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-surface/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <h1 className="text-headline-md font-bold text-primary">Rehabilitación</h1>
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>

        <main className="flex-1 px-5 pb-32 pt-4">
          <Skeleton className="mb-10 h-32 w-full rounded-xl" />
          <div className="mb-6 flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </main>
      </div>

      {/* Web */}
      <div className="hidden min-h-screen bg-background text-text-1 md:block">
        <main className="min-h-screen">
          <header className="sticky top-0 z-40 mx-auto flex w-full max-w-app items-center justify-between bg-surface px-6 py-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </header>

          <div className="mt-4 px-6">
            <div className="flex items-center gap-10 border-b border-border/20 pb-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>

          <div className="flex flex-col gap-6 p-6 lg:flex-row">
            <section className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            </section>
            <aside className="w-full space-y-6 lg:w-[320px]">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}

function PainHistoryCard({
  painLevel,
  history,
  className = "border-border",
}: {
  painLevel: string;
  history: PainLogPoint[];
  className?: string;
}) {
  const recent = history.slice(-10);
  return (
    <div className={`rounded-xl border bg-surface-1 p-6 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-label text-label-md text-text-3">
          Último dolor registrado
        </span>
        <span className="font-metric text-metric-xl text-error">
          {painLevel}
        </span>
      </div>
      {recent.length > 0 ? (
        <div className="flex h-24 items-end gap-1.5">
          {recent.map((point) => (
            <div
              key={point.date}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className="w-full rounded-t-sm bg-error/70"
                style={{ height: `${Math.max((point.level / 10) * 100, 4)}%` }}
                title={`${point.level}/10 · ${new Date(point.date).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}`}
              />
              <span className="text-[10px] text-text-3">
                {new Date(point.date).toLocaleDateString("es-PE", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-md text-text-3">
          Todavía no hay registros de dolor.
        </p>
      )}
    </div>
  );
}

function isPastOrToday(dateIso: string): boolean {
  return new Date(dateIso).getTime() <= Date.now();
}

function formatAppointmentTime(dateIso: string): string {
  return new Date(dateIso).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AppointmentListItem({
  apt,
  pendingAttendance,
  deleting,
  onMarkAttendance,
  onEdit,
  onDelete,
}: {
  apt: Appointment;
  pendingAttendance: boolean;
  deleting: boolean;
  onMarkAttendance: (attended: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/30 bg-surface-1 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex min-w-[64px] shrink-0 flex-col items-center rounded-lg bg-surface-3 px-3 py-2 text-text-1">
          <span className="font-label text-label-md font-bold">{apt.month}</span>
          <span className="font-metric text-[24px] sm:text-[28px]">{apt.day}</span>
          <span className="font-label text-[11px] text-text-3">
            {formatAppointmentTime(apt.date)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h4 className="truncate text-body-lg font-bold">{apt.title}</h4>
            <StatusBadge
              status={apt.type === "THERAPY" ? "therapy" : "medical"}
            />
          </div>
          <p className="flex items-center gap-1 font-label text-label-md text-text-3">
            <Icon name="person" className="text-[14px]" />
            {apt.provider}
          </p>
          {apt.notes && (
            <p className="font-label text-label-md text-text-3">
              {apt.notes}
            </p>
          )}
          {isPastOrToday(apt.date) && (
            <div className="mt-2">
              <AppointmentAttendanceControl
                attended={apt.attended}
                pending={pendingAttendance}
                onMark={onMarkAttendance}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label={`Editar cita ${apt.title}`}
        >
          <Icon name="edit" className="text-[18px] text-text-3" />
        </Button>
        <DeleteAppointmentButton
          title={apt.title}
          deleting={deleting}
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
}

function DeleteAppointmentButton({
  title,
  deleting,
  onConfirm,
}: {
  title: string;
  deleting: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="self-end text-text-3 hover:text-error sm:self-start"
          disabled={deleting}
          aria-label={`Eliminar cita ${title}`}
        >
          <Icon name="trash" className="text-[18px]" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar cita</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Eliminar la cita con &quot;{title}&quot;? Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AppointmentAttendanceControl({
  attended,
  pending,
  onMark,
}: {
  attended: boolean | null;
  pending: boolean;
  onMark: (attended: boolean) => void;
}) {
  if (attended !== null) {
    return (
      <button
        type="button"
        onClick={() => onMark(!attended)}
        disabled={pending}
        className={`flex items-center gap-1 rounded-full px-2 py-1 font-label text-label-md transition-all active:scale-95 disabled:opacity-60 ${
          attended ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
        }`}
      >
        <Icon
          name={attended ? "check_circle" : "close"}
          className="text-[16px]"
        />
        {attended ? "Asististe" : "No asististe"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-label text-label-md text-text-3">
        ¿Asististe?
      </span>
      <button
        type="button"
        onClick={() => onMark(true)}
        disabled={pending}
        className="rounded-full bg-primary/10 p-1.5 text-primary transition-all active:scale-95 disabled:opacity-60"
        aria-label="Marcar como asistida"
      >
        <Icon name="check" className="text-[16px]" />
      </button>
      <button
        type="button"
        onClick={() => onMark(false)}
        disabled={pending}
        className="rounded-full bg-error/10 p-1.5 text-error transition-all active:scale-95 disabled:opacity-60"
        aria-label="Marcar como no asistida"
      >
        <Icon name="close" className="text-[16px]" />
      </button>
    </div>
  );
}

function toBadgeStatus(status: RecoveryPlanStatus): StatusBadgeStatus {
  switch (status) {
    case "COMPLETED":
      return "completed";
    case "PAUSED":
      return "paused";
    default:
      return "active";
  }
}

function PlanStatusControl({
  status,
  updating,
  onChangeStatus,
}: {
  status: RecoveryPlanStatus;
  updating: boolean;
  onChangeStatus: (status: RecoveryPlanStatus) => void;
}) {
  if (status === "COMPLETED") return null;

  if (status === "PAUSED") {
    return (
      <ConfirmStatusButton
        label="Reactivar plan"
        icon="play_circle"
        className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
        confirmTitle="Reactivar plan"
        confirmDescription="El plan volverá a estar activo y aparecerá de nuevo en tu panel de rehabilitación."
        confirmLabel="Reactivar"
        disabled={updating}
        onConfirm={() => onChangeStatus("ACTIVE")}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ConfirmStatusButton
        label="Marcar como completado"
        icon="check_circle"
        className="border-success/40 bg-success/10 text-success hover:bg-success/20"
        confirmTitle="Completar plan"
        confirmDescription="El plan pasará a estado completado y podrás crear un nuevo plan de recuperación. Esta acción no se puede deshacer."
        confirmLabel="Completar"
        disabled={updating}
        onConfirm={() => onChangeStatus("COMPLETED")}
      />
      <ConfirmStatusButton
        label="Pausar plan"
        icon="pause_circle"
        className="border-warning/40 bg-warning/10 text-warning hover:bg-warning/20"
        confirmTitle="Pausar plan"
        confirmDescription="El plan dejará de estar activo hasta que lo reactives."
        confirmLabel="Pausar"
        disabled={updating}
        onConfirm={() => onChangeStatus("PAUSED")}
      />
    </div>
  );
}

function ConfirmStatusButton({
  label,
  icon,
  className,
  confirmTitle,
  confirmDescription,
  confirmLabel,
  disabled,
  onConfirm,
}: {
  label: string;
  icon: string;
  className?: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  disabled: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className={className}
        >
          <Icon name={icon} className="text-[18px]" />
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ExtensionForm({
  value,
  setValue,
  onSubmit,
  submitting,
  error,
}: {
  value: string;
  setValue: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <h4 className="mb-3 font-label text-label-md text-text-3">
        Registrar extensión de rodilla (grados)
      </h4>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ej. 5"
          className="w-28 rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
        />
        <span className="font-label text-label-md text-text-3">°</span>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || value.trim() === ""}
          className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
        >
          {submitting ? "Guardando…" : "Registrar"}
        </button>
      </div>
      {error && <p className="mt-2 text-body-md text-error">{error}</p>}
    </div>
  );
}

function PainLogForm({
  painLevel,
  setPainLevel,
  painNote,
  setPainNote,
  onSubmit,
  submitting,
  error,
}: {
  painLevel: string;
  setPainLevel: (value: string) => void;
  painNote: string;
  setPainNote: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <h4 className="mb-3 font-label text-label-md text-text-3">
        Registrar dolor de hoy (0-10)
      </h4>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          min={0}
          max={10}
          value={painLevel}
          onChange={(e) => setPainLevel(e.target.value)}
          className="w-20 rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
        />
        <input
          type="text"
          value={painNote}
          onChange={(e) => setPainNote(e.target.value)}
          placeholder="Nota (opcional)"
          className="min-w-[160px] flex-1 rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
        >
          {submitting ? "Guardando…" : "Registrar"}
        </button>
      </div>
      {error && <p className="mt-2 text-body-md text-error">{error}</p>}
    </div>
  );
}
