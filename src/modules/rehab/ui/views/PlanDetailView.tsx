"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthenticatedUser } from "@/modules/auth/ui/context/AuthenticatedUserContext";
import { Icon } from "@/shared/ui/Icon";
import { RehabRepository } from "@/modules/rehab/domain/RehabRepository";
import { createRehabRepository } from "@/modules/rehab/infrastructure/createRehabRepository";
import { usePlan } from "@/modules/rehab/ui/hooks/usePlan";
import { AddExerciseDialog } from "@/modules/rehab/ui/components/AddExerciseDialog";

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
  } = usePlan(activeRepository, planId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-on-surface-variant">
        Cargando plan…
      </div>
    );
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
      <div className="flex min-h-screen flex-col bg-background text-on-surface md:hidden">
        <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-surface/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/rehab"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface-container active:scale-90"
            >
              <Icon name="arrow_back" className="text-primary" />
            </Link>
            <h1 className="text-headline-md font-bold text-primary">Rehabilitación</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high"
            >
              <Icon name="notifications" />
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant">
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
            <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl bg-primary-container p-6 text-on-primary-container shadow-sm">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-on-primary/10 blur-2xl" />
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-white/20 px-2 py-1 font-label text-label-md uppercase tracking-wider">
                  {plan.phaseLabel}
                </span>
                <span className="rounded-full bg-on-primary-container/20 px-2 py-1 font-label text-label-md text-primary-fixed">
                  {plan.dayProgress}
                </span>
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

          <div className="sticky top-[72px] z-30 mb-6 flex gap-2 overflow-x-auto bg-background/95 py-2 no-scrollbar">
            {tabsMobile.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-6 py-2 font-label text-label-md transition-all ${
                  tab === t.id
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "exercises" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-headline-md font-semibold text-on-surface">
                  Protocolo de hoy
                </h3>
                <span className="font-label text-label-md text-primary">
                  Quedan {plan.remainingToday}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExerciseOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary-container/5 py-3 font-label text-label-md text-primary transition-all active:scale-95"
              >
                <Icon name="add" className="text-[20px]" />
                Agregar ejercicio
              </button>
              {plan.exercises
                .filter((e) => e.id !== "glute")
                .map((ex) =>
                  ex.completed ? (
                    <div
                      key={ex.id}
                      className="flex flex-col gap-4 rounded-xl border border-transparent bg-surface-container-low p-4 opacity-70"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                          <Icon
                            name="check_circle"
                            filled
                            className="text-[32px] text-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[18px] font-bold leading-tight text-on-surface">
                            {ex.name}
                          </h4>
                          <p className="font-label text-label-md text-on-surface-variant">
                            {ex.detail}
                          </p>
                        </div>
                        <span className="font-label text-label-md font-bold text-primary">
                          COMPLETADO
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={ex.id}
                      className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-container">
                          <Icon
                            name={ex.icon}
                            className="text-[32px] text-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[18px] font-bold leading-tight text-on-surface">
                            {ex.name}
                          </h4>
                          <p className="font-label text-label-md text-on-surface-variant">
                            {ex.detail}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-metric text-[24px] text-primary">
                            {String(counts[ex.id] ?? 0).padStart(2, "0")}
                          </span>
                          <span className="font-label text-label-md text-outline">
                            /{ex.target}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-2">
                        <button
                          type="button"
                          onClick={() => adjust(ex.id, -1, ex.target)}
                          className="flex flex-1 items-center justify-center rounded-lg bg-surface-container-highest py-4 transition-transform active:scale-95"
                        >
                          <Icon name="remove" />
                        </button>
                        <div className="w-12 text-center">
                          <span className="text-headline-md font-bold">
                            {counts[ex.id] ?? 0}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => adjust(ex.id, 1, ex.target)}
                          className="flex flex-1 items-center justify-center rounded-lg bg-primary-container py-4 text-on-primary-container transition-transform active:scale-95"
                        >
                          <Icon name="add" />
                        </button>
                      </div>
                    </div>
                  ),
                )}
            </div>
          )}

          {tab === "appointments" && (
            <div className="space-y-4">
              <h3 className="px-1 text-headline-md font-semibold text-on-surface">
                Próximas sesiones
              </h3>
              {plan.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
                >
                  <div className="flex min-w-[70px] flex-col items-center justify-center rounded-lg bg-secondary-container/10 px-4 py-2 text-on-secondary-container">
                    <span className="font-label text-label-md font-bold">
                      {apt.month}
                    </span>
                    <span className="font-metric text-[28px]">{apt.day}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[18px] font-bold text-on-surface">
                      {apt.title}
                    </h4>
                    <p className="font-label text-label-md text-on-surface-variant">
                      {apt.detail}
                    </p>
                  </div>
                  <Icon name="chevron_right" className="text-outline" />
                </div>
              ))}
            </div>
          )}

          {tab === "metrics" && (
            <div className="space-y-4">
              <h3 className="px-1 text-headline-md font-semibold text-on-surface">
                Indicadores de recuperación
              </h3>
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-label text-label-md text-on-surface-variant">
                    Rango de extensión de rodilla
                  </span>
                  <span className="font-bold text-primary">
                    {plan.metrics.kneeExtensionNote}
                  </span>
                </div>
                <div className="flex h-32 items-end gap-2">
                  <div className="h-1/4 flex-1 rounded-t-sm bg-surface-container-high" />
                  <div className="h-2/4 flex-1 rounded-t-sm bg-surface-container-high" />
                  <div className="h-3/4 flex-1 rounded-t-sm bg-surface-container-high" />
                  <div className="h-full flex-1 rounded-t-sm bg-primary" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
                <div>
                  <span className="font-label text-label-md text-on-surface-variant">
                    Nivel de dolor (prom.)
                  </span>
                  <p className="font-metric text-metric-xl text-secondary">
                    {plan.metrics.painLevel}
                  </p>
                </div>
                <Icon name="trending_down" className="text-[40px] text-secondary" />
              </div>
            </div>
          )}
        </main>

        <Link
          href="/rehab"
          className="fixed bottom-24 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-lg transition-transform active:scale-90"
        >
          <Icon name="add" className="text-[32px]" />
        </Link>
      </div>

      {/* Web */}
      <div className="hidden min-h-screen bg-background text-on-surface md:block">
        <main className="min-h-screen">
          <header className="sticky top-0 z-40 mx-auto flex w-full max-w-app items-center justify-between bg-surface px-6 py-4">
            <div className="flex flex-col">
              <h2 className="text-headline-md font-bold text-primary">
                {plan.titleWeb}
              </h2>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <p className="font-label text-label-md text-on-surface-variant">
                  {plan.weekLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-1 sm:flex">
                <Icon name="search" className="mr-2 text-outline-variant" />
                <input
                  className="w-48 border-none bg-transparent text-body-md focus:outline-none"
                  placeholder="Buscar ejercicios..."
                  type="text"
                />
              </div>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-surface-container-high"
              >
                <Icon name="notifications" />
              </button>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-surface-container-high"
              >
                <Icon name="settings" />
              </button>
            </div>
          </header>

          <div className="mt-4 px-6">
            <div className="flex items-center gap-10 border-b border-outline-variant/20">
              {tabsWeb.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`pb-4 font-label text-label-md transition-colors ${
                    tab === t.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-on-surface-variant hover:text-primary"
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
                <h3 className="text-headline-md text-on-surface">
                  Protocolo de hoy
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-lg bg-surface-container-high px-4 py-2 font-label text-label-md text-on-surface-variant"
                  >
                    <Icon name="filter_list" className="text-[20px]" />
                    Filtrar
                  </button>
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
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 font-label text-label-md text-on-primary transition-all active:scale-95"
                  >
                    <Icon name="play_arrow" className="text-[20px]" />
                    Comenzar sesión
                  </button>
                </div>
              </div>

              {(tab === "exercises" || tab === "photos") && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {plan.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="group flex gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 transition-all hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
                    >
                      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
                        <Image
                          src={ex.image}
                          alt={ex.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100">
                          <Icon
                            name="play_circle"
                            className="text-metric-xl text-primary"
                          />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="rounded bg-primary-container/20 px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider text-primary">
                            {ex.category}
                          </span>
                          <Icon
                            name="info"
                            className="text-[18px] text-outline-variant"
                          />
                        </div>
                        <h4 className="mb-1 text-body-lg font-semibold text-on-surface">
                          {ex.name}
                        </h4>
                        <div className="flex items-center gap-4 font-label text-label-md text-on-surface-variant">
                          <div className="flex items-center gap-1">
                            <Icon name="repeat" className="text-[16px]" />
                            {ex.sets} series
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="history" className="text-[16px]" />
                            {ex.reps} repeticiones
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "appointments" && (
                <div className="space-y-4">
                  {plan.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6"
                    >
                      <div className="flex min-w-[70px] flex-col items-center rounded-lg bg-secondary-container/10 px-4 py-2 text-on-secondary-container">
                        <span className="font-label text-label-md font-bold">
                          {apt.month}
                        </span>
                        <span className="font-metric text-[28px]">{apt.day}</span>
                      </div>
                      <div>
                        <h4 className="text-body-lg font-bold">{apt.title}</h4>
                        <p className="font-label text-label-md text-on-surface-variant">
                          {apt.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "metrics" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                    <div className="mb-4 flex justify-between">
                      <span className="font-label text-label-md text-on-surface-variant">
                        Rango de extensión de rodilla
                      </span>
                      <span className="font-bold text-primary">
                        {plan.metrics.kneeExtensionNote}
                      </span>
                    </div>
                    <div className="flex h-40 items-end gap-2">
                      <div className="h-1/4 flex-1 rounded-t-sm bg-surface-container-high" />
                      <div className="h-2/4 flex-1 rounded-t-sm bg-surface-container-high" />
                      <div className="h-3/4 flex-1 rounded-t-sm bg-surface-container-high" />
                      <div className="h-full flex-1 rounded-t-sm bg-primary" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                    <div>
                      <span className="font-label text-label-md text-on-surface-variant">
                        Nivel de dolor (prom.)
                      </span>
                      <p className="font-metric text-metric-xl text-secondary">
                        {plan.metrics.painLevel}
                      </p>
                    </div>
                    <Icon
                      name="trending_down"
                      className="text-[40px] text-secondary"
                    />
                  </div>
                </div>
              )}
            </section>

            <aside className="w-full space-y-6 lg:w-[320px]">
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-elevation">
                <h3 className="mb-4 text-headline-md">Estadísticas de sesión</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-label text-label-md text-on-surface-variant">
                      Completado hoy
                    </span>
                    <span className="font-bold text-primary">1 / 4</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full w-1/4 rounded-full bg-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span className="font-label text-label-md text-on-surface-variant">
                      Cumplimiento
                    </span>
                    <span className="font-bold">92%</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-tertiary-container p-6 text-on-tertiary-container">
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
        <AddExerciseDialog
          onClose={() => setIsAddExerciseOpen(false)}
          onSubmit={addExercise}
          submitting={addingExercise}
          error={addExerciseError}
        />
      )}
    </>
  );
}
