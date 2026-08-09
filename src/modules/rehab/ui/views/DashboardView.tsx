"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthenticatedUser } from "@/modules/auth/ui/context/AuthenticatedUserContext";
import { StatusBadge, Skeleton } from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import { Logo } from "@/shared/ui/Logo";
import { RehabRepository } from "@/modules/rehab/domain/RehabRepository";
import { DashboardSummary } from "@/modules/rehab/domain/DashboardSummary";
import { createRehabRepository } from "@/modules/rehab/infrastructure/createRehabRepository";
import { useDashboard } from "@/modules/rehab/ui/hooks/useDashboard";
import { planExerciseHref } from "@/modules/rehab/ui/rehabRoutes";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=LT";

const WEEKDAY_LABELS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

function todayLabel(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(now);
}

function ProgressRing({
  percent,
  size = 64,
  stroke = 8,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90 transform">
        <circle
          className="text-surface-3"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
        />
        <circle
          className="text-primary"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-label text-label-md text-primary">
        {percent}%
      </div>
    </div>
  );
}

export function DashboardView({
  repository,
}: { repository?: RehabRepository } = {}) {
  const activeRepository = useMemo(
    () => repository ?? createRehabRepository(),
    [repository],
  );
  const authUser = useAuthenticatedUser();
  const { dashboards, loading, error, isEmpty } = useDashboard(activeRepository);
  const [bodyPart, setBodyPart] = useState("Rodilla");
  const [injuryType, setInjuryType] = useState("Recuperación de LCA");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

  async function handleCreatePlan() {
    setCreating(true);
    setCreateError(null);
    try {
      await activeRepository.createPlan({
        bodyPart,
        injuryType,
        surgeryDate: new Date().toISOString(),
      });
      window.location.reload();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "No se pudo crear el plan",
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-error">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <h2 className="text-headline-md text-text-1">Sin planes de recuperación</h2>
        <p className="text-center text-text-3">
          Crea tu primer plan para empezar a registrar progreso.
        </p>
        <input
          className="w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2"
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
          placeholder="Parte del cuerpo"
        />
        <input
          className="w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2"
          value={injuryType}
          onChange={(e) => setInjuryType(e.target.value)}
          placeholder="Tipo de lesión"
        />
        {createError && <p className="text-error text-sm">{createError}</p>}
        <button
          type="button"
          disabled={creating}
          onClick={handleCreatePlan}
          className="rounded-xl bg-primary px-6 py-3 text-primary-foreground disabled:opacity-50"
        >
          {creating ? "Creando…" : "Crear plan"}
        </button>
      </div>
    );
  }

  if (dashboards.length === 0) return null;

  const displayName = authUser.email.split("@")[0] ?? authUser.email;
  const showPlanTitle = dashboards.length > 1;

  return (
    <>
      {/* Mobile */}
      <div className="min-h-screen bg-background pb-32 text-text-1 md:hidden">
        <header className="fixed left-0 top-0 z-40 w-full bg-surface bg-dot-grid">
          <div className="mx-auto flex w-full max-w-app items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <h1 className="text-headline-md font-bold text-primary">LifeTrack OS</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsCreatePlanOpen(true)}
                className="rounded-full p-2 hover:bg-surface-3"
                aria-label="Nuevo plan"
                title="Nuevo plan"
              >
                <Icon name="add" className="text-text-3" />
              </button>
              <button type="button" className="rounded-full p-2 hover:bg-surface-3">
                <Icon name="notifications" className="text-text-3" />
              </button>
              <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-surface-2">
                <Image
                  src={DEFAULT_AVATAR}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mt-20 space-y-10 px-5">
          {dashboards.map((d) => (
            <MobilePlanSection key={d.planId} d={d} showTitle={showPlanTitle} />
          ))}
        </main>
      </div>

      {/* Web */}
      <div className="hidden overflow-hidden bg-background text-text-1 md:block">
        <main className="h-screen overflow-y-auto bg-background p-10">
          <div className="mx-auto max-w-app">
            <header className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-headline-lg text-text-1">Panel de rehabilitación</h2>
                <p className="text-body-lg text-text-3">
                  Sigue tu recuperación y tus objetivos diarios — {todayLabel()}.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreatePlanOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95"
                >
                  <Icon name="add" className="text-[18px]" />
                  Nuevo plan
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-surface-4 p-2 text-primary hover:bg-surface-3"
                >
                  <Icon name="notifications" />
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-surface-4 p-2 text-primary hover:bg-surface-3"
                >
                  <Icon name="settings" />
                </button>
              </div>
            </header>

            <div className="space-y-10">
              {dashboards.map((d) => (
                <WebPlanSection key={d.planId} d={d} showTitle={showPlanTitle} />
              ))}
            </div>
          </div>
        </main>
      </div>

      {isCreatePlanOpen && (
        <CreatePlanDialog
          bodyPart={bodyPart}
          setBodyPart={setBodyPart}
          injuryType={injuryType}
          setInjuryType={setInjuryType}
          creating={creating}
          error={createError}
          onClose={() => setIsCreatePlanOpen(false)}
          onSubmit={handleCreatePlan}
        />
      )}
    </>
  );
}

function CreatePlanDialog({
  bodyPart,
  setBodyPart,
  injuryType,
  setInjuryType,
  creating,
  error,
  onClose,
  onSubmit,
}: {
  bodyPart: string;
  setBodyPart: (value: string) => void;
  injuryType: string;
  setInjuryType: (value: string) => void;
  creating: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Nuevo plan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-3"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Parte del cuerpo
            </label>
            <input
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              placeholder="Ej. Rodilla"
            />
          </div>
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Tipo de lesión / objetivo
            </label>
            <input
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              value={injuryType}
              onChange={(e) => setInjuryType(e.target.value)}
              placeholder="Ej. Bajar de peso"
            />
          </div>

          {error && <p className="text-body-md text-error">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-label text-label-md text-text-3 hover:bg-surface-3"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={onSubmit}
              className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
            >
              {creating ? "Creando…" : "Crear plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Mobile */}
      <div className="min-h-screen bg-background pb-32 text-text-1 md:hidden">
        <header className="fixed left-0 top-0 z-40 w-full bg-surface bg-dot-grid">
          <div className="mx-auto flex w-full max-w-app items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <h1 className="text-headline-md font-bold text-primary">LifeTrack OS</h1>
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>

        <main className="mt-20 space-y-10 px-5">
          <section className="negative-space-pocket space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-12 w-full rounded-lg" />
            </div>
          </section>

          <section className="negative-space-pocket">
            <Skeleton className="h-20 w-full rounded-xl" />
          </section>

          <section className="grid grid-cols-2 gap-4 negative-space-pocket">
            <Skeleton className="col-span-2 h-40 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </section>

          <section className="negative-space-pocket space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </section>
        </main>
      </div>

      {/* Web */}
      <div className="hidden overflow-hidden bg-background text-text-1 md:block">
        <main className="h-screen overflow-y-auto bg-background p-10">
          <div className="mx-auto max-w-app">
            <header className="mb-10 flex items-end justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </header>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 space-y-6 lg:col-span-7">
                <Skeleton className="h-40 w-full rounded-xl" />
                <div className="space-y-4 rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </div>
              <div className="col-span-12 space-y-6 lg:col-span-5">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function MobilePlanSection({
  d,
  showTitle,
}: {
  d: DashboardSummary;
  showTitle: boolean;
}) {
  return (
    <div className="space-y-6">
      {showTitle && (
        <h2 className="text-headline-md font-bold text-text-1">{d.focusTitle}</h2>
      )}

      <section className="negative-space-pocket">
        <div className="mb-6 flex flex-col gap-2">
          <span className="font-label text-label-md font-bold uppercase tracking-wider text-primary">
            Enfoque de hoy
          </span>
          {!showTitle && (
            <h2 className="text-headline-lg-mobile text-text-1">{d.focusTitle}</h2>
          )}
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface-1 p-6 card-elevation">
          <div className="absolute right-0 top-0 p-6 opacity-10">
            <Icon name="stabilization" filled className="text-[80px]" />
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-body-md text-text-3">
                  Progreso de ejercicios de hoy
                </p>
                <p className="font-metric text-metric-xl text-primary">
                  {d.exerciseProgress.done}{" "}
                  <span className="text-headline-md font-normal text-text-3">
                    / {d.exerciseProgress.total}
                  </span>
                </p>
              </div>
              <ProgressRing percent={d.exerciseProgress.percent} />
            </div>
            <Link
              href={`/rehab/plans/${d.planId}`}
              className="w-full rounded-lg bg-primary py-4 text-center font-label text-label-md text-primary-foreground  transition-transform active:scale-95"
            >
              Continuar sesión
            </Link>
          </div>
        </div>
      </section>

      <section className="negative-space-pocket">
        <div className="flex items-center gap-6 rounded-xl border border-border bg-surface-2 p-6 text-text-1">
          <div className="animate-float rounded-lg bg-primary/10 p-4">
            <Icon name="calendar_today" filled />
          </div>
          <div>
            <h3 className="mb-1 font-label text-label-md font-bold">
              {d.nextAppointment.title}
            </h3>
            <p className="text-body-md opacity-90">{d.nextAppointment.detail}</p>
          </div>
          <div className="ml-auto">
            <Icon name="chevron_right" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 negative-space-pocket">
        <div className="col-span-2 flex flex-col gap-4 rounded-xl border border-border bg-surface-1 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-label text-label-md text-text-3">
              Cumplimiento semanal
            </h3>
            <span className="font-label text-label-md font-bold text-primary">
              {d.weeklyCompliance}%
            </span>
          </div>
          <div className="flex h-20 items-end justify-between gap-1">
            {d.weeklyBars.map((h, i) => (
              <div
                key={i}
                className="w-full rounded-t-sm bg-primary"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between font-label text-[10px] text-text-3 opacity-60">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-1 p-6">
          <p className="font-label text-label-md text-text-3">Recuperación</p>
          <p className="text-headline-md text-text-1">
            {d.recoveryScore}{" "}
            <span className="text-body-md font-normal opacity-60">/ 100</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${d.recoveryScore}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-1 p-6">
          <p className="font-label text-label-md text-text-3">Racha</p>
          <p className="text-headline-md text-text-1">
            {d.streakDays}{" "}
            <span className="text-body-md font-normal opacity-60">días</span>
          </p>
        </div>
      </section>

      <section className="negative-space-pocket">
        <h3 className="mb-4 font-label text-label-md uppercase tracking-wider text-text-3">
          Próximamente
        </h3>
        <div className="space-y-2">
          {d.upNext.map((item) => (
            <Link
              key={item.id}
              href={planExerciseHref(d.planId, item.id)}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface-1 p-4 transition-all hover:border-primary hover:bg-surface-2 active:bg-surface-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-2 text-primary">
                <Icon name={item.icon} />
              </div>
              <div className="flex-1">
                <p className="text-body-md font-semibold text-text-1">
                  {item.name}
                </p>
                <p className="font-label text-label-md text-text-3">
                  {item.detail}
                </p>
              </div>
              <Icon name="play_circle" className="text-primary" />
            </Link>
          ))}
          {d.upNext.length === 0 && (
            <p className="text-body-md text-text-3">
              No quedan ejercicios pendientes por hoy.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function WebPlanSection({
  d,
  showTitle,
}: {
  d: DashboardSummary;
  showTitle: boolean;
}) {
  return (
    <div className="space-y-6 border-b border-border/20 pb-10 last:border-b-0 last:pb-0">
      {showTitle && (
        <h3 className="text-headline-md text-text-1">{d.focusTitle}</h3>
      )}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-7">
        <section className="relative overflow-hidden rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
          <div className="absolute right-0 top-0 p-6">
            <span className="rounded-full bg-primary px-4 py-1 font-label text-label-md text-primary-foreground">
              Fase actual
            </span>
          </div>
          <div className="flex items-start gap-6">
            <ProgressRing percent={d.phase.percent} size={80} />
            <div>
              <h3 className="mb-1 text-headline-md">{d.phase.name}</h3>
              <p className="mb-4 text-body-md text-text-3">
                {d.phase.description}
              </p>
              <div className="flex gap-4">
                <Link
                  href={`/rehab/plans/${d.planId}`}
                  className="rounded-lg bg-primary px-6 py-2 font-label text-label-md text-primary-foreground hover:opacity-90"
                >
                  Ver detalles de la fase
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-headline-md">Ejercicios de hoy</h3>
            <span className="font-label text-label-md text-text-3 capitalize">
              {todayLabel()}
            </span>
          </div>
          <div className="space-y-4">
            {d.todayExercises.map((ex) => {
              const rowClassName = `flex items-center justify-between rounded-lg p-4 transition-all ${
                ex.status === "completed"
                  ? "border border-transparent bg-surface-1"
                  : ex.status === "urgent"
                    ? "cursor-pointer border border-error/30 bg-error/10 hover:border-error hover:bg-error/15"
                    : "cursor-pointer border border-border/30 bg-surface-2 hover:border-primary hover:bg-surface-3"
              }`;

              const rowContent = (
                <>
                  <div className="flex items-center gap-4">
                    {ex.status === "completed" ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Icon name="check" className="text-[18px]" />
                      </div>
                    ) : ex.status === "urgent" ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-error">
                        <Icon
                          name="priority_high"
                          className="text-[18px] text-error"
                        />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-border" />
                    )}
                    <div>
                      <p
                        className={`font-bold ${
                          ex.status === "urgent" ? "text-error" : "text-text-1"
                        }`}
                      >
                        {ex.name}
                      </p>
                      <p className="text-[12px] text-text-3">{ex.detail}</p>
                    </div>
                  </div>
                  <StatusBadge
                    status={
                      ex.status === "completed"
                        ? "completed"
                        : ex.status === "urgent"
                          ? "overdue"
                          : "pending"
                    }
                    label={
                      ex.status === "completed"
                        ? "Completado"
                        : ex.status === "urgent"
                          ? "Vencido"
                          : "Pendiente"
                    }
                  />
                </>
              );

              if (ex.status === "completed") {
                return (
                  <div key={ex.id} className={rowClassName}>
                    {rowContent}
                  </div>
                );
              }

              return (
                <Link
                  key={ex.id}
                  href={planExerciseHref(d.planId, ex.id)}
                  className={rowClassName}
                >
                  {rowContent}
                </Link>
              );
            })}
            {d.todayExercises.length === 0 && (
              <p className="text-body-md text-text-3">
                No tenés ejercicios agendados para hoy.
              </p>
            )}
          </div>
        </section>
        </div>

      <div className="col-span-12 space-y-6 lg:col-span-5">
        <section className="rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-label text-label-md text-text-3">
              Cumplimiento semanal
            </h3>
            <span className="font-metric text-metric-xl text-primary">
              {d.weeklyCompliance}%
            </span>
          </div>
          <div className="flex h-28 items-end justify-between gap-2">
            {d.weeklyBars.map((h, i) => (
              <div
                key={i}
                className="w-full rounded-t-sm bg-primary"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="mt-4 font-label text-label-md text-text-3">
            Racha actual: <span className="font-bold text-primary">{d.streakDays} días</span>
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface-2 p-6 text-text-1">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="calendar_today" filled />
            <h3 className="font-label text-label-md font-bold">
              {d.nextAppointment.title}
            </h3>
          </div>
          <p className="text-body-md opacity-90">{d.nextAppointment.detail}</p>
        </section>

        <Link
          href={`/rehab/plans/${d.planId}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-label text-label-md text-primary-foreground  transition-all hover:opacity-90"
        >
          Abrir plan de recuperación
          <Icon name="arrow_forward" />
        </Link>
      </div>
      </div>
    </div>
  );
}
