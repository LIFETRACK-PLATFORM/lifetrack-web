"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthenticatedUser } from "@/modules/auth/ui/context/AuthenticatedUserContext";
import { Icon } from "@/shared/ui/Icon";
import { RehabRepository } from "@/modules/rehab/domain/RehabRepository";
import { createRehabRepository } from "@/modules/rehab/infrastructure/createRehabRepository";
import { useDashboard } from "@/modules/rehab/ui/hooks/useDashboard";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=LT";

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
          className="text-surface-container-high"
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
  const { dashboard, loading, error, isEmpty } = useDashboard(activeRepository);
  const [bodyPart, setBodyPart] = useState("Knee");
  const [injuryType, setInjuryType] = useState("ACL Recovery");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
    return (
      <div className="flex min-h-screen items-center justify-center text-on-surface-variant">
        Cargando recuperación…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-error">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-4 py-2 text-on-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <h2 className="text-headline-md text-on-surface">Sin planes de recuperación</h2>
        <p className="text-center text-on-surface-variant">
          Crea tu primer plan para empezar a registrar progreso.
        </p>
        <input
          className="w-full max-w-sm rounded-lg border border-outline-variant bg-surface px-3 py-2"
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
          placeholder="Parte del cuerpo"
        />
        <input
          className="w-full max-w-sm rounded-lg border border-outline-variant bg-surface px-3 py-2"
          value={injuryType}
          onChange={(e) => setInjuryType(e.target.value)}
          placeholder="Tipo de lesión"
        />
        {createError && <p className="text-error text-sm">{createError}</p>}
        <button
          type="button"
          disabled={creating}
          onClick={handleCreatePlan}
          className="rounded-xl bg-primary px-6 py-3 text-on-primary disabled:opacity-50"
        >
          {creating ? "Creando…" : "Crear plan"}
        </button>
      </div>
    );
  }

  if (!dashboard) return null;

  const d = dashboard;
  const displayName = authUser.email.split("@")[0] ?? authUser.email;

  return (
    <>
      {/* Mobile */}
      <div className="min-h-screen bg-background pb-32 text-on-surface md:hidden">
        <header className="fixed left-0 top-0 z-40 w-full bg-surface">
          <div className="mx-auto flex w-full max-w-app items-center justify-between px-6 py-4">
            <h1 className="text-headline-md font-bold text-primary">LifeTrack OS</h1>
            <div className="flex items-center gap-4">
              <button type="button" className="rounded-full p-2 hover:bg-surface-container-high">
                <Icon name="notifications" className="text-on-surface-variant" />
              </button>
              <div className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant bg-surface-container">
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

        <main className="mt-20 space-y-6 px-5">
          <section className="negative-space-pocket">
            <div className="mb-6 flex flex-col gap-2">
              <span className="font-label text-label-md font-bold uppercase tracking-wider text-primary">
                Today&apos;s Focus
              </span>
              <h2 className="text-headline-lg-mobile text-on-surface">{d.focusTitle}</h2>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 card-elevation">
              <div className="absolute right-0 top-0 p-6 opacity-10">
                <Icon name="stabilization" filled className="text-[80px]" />
              </div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-body-md text-on-surface-variant">
                      Exercise Progress
                    </p>
                    <p className="font-metric text-metric-xl text-primary">
                      {d.exerciseProgress.done}{" "}
                      <span className="text-headline-md font-normal text-on-surface-variant">
                        / {d.exerciseProgress.total}
                      </span>
                    </p>
                  </div>
                  <ProgressRing percent={d.exerciseProgress.percent} />
                </div>
                <Link
                  href={`/rehab/plans/${d.planId}`}
                  className="w-full rounded-lg bg-primary py-4 text-center font-label text-label-md text-on-primary shadow-sm transition-transform active:scale-95"
                >
                  Continue Session
                </Link>
              </div>
            </div>
          </section>

          <section className="negative-space-pocket">
            <div className="flex items-center gap-6 rounded-xl border border-tertiary/20 bg-tertiary-container p-6 text-on-tertiary-container shadow-md">
              <div className="animate-float rounded-lg bg-on-tertiary-container/10 p-4">
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
            <div className="col-span-2 flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-label text-label-md text-on-surface-variant">
                  Weekly Compliance
                </h3>
                <span className="font-label text-label-md font-bold text-primary">
                  {d.weeklyCompliance}%
                </span>
              </div>
              <div className="flex h-20 items-end justify-between gap-1">
                {d.weeklyBars.map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-sm ${
                      i < 5 ? "bg-primary" : "bg-surface-container-high"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between font-label text-[10px] text-on-surface-variant opacity-60">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-6">
              <p className="font-label text-label-md text-on-surface-variant">Recovery</p>
              <p className="text-headline-md text-on-surface">
                {d.recoveryScore}{" "}
                <span className="text-body-md font-normal opacity-60">/ 100</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${d.recoveryScore}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-6">
              <p className="font-label text-label-md text-on-surface-variant">Active Min</p>
              <p className="text-headline-md text-on-surface">
                {d.activeMinutes}{" "}
                <span className="text-body-md font-normal opacity-60">min</span>
              </p>
              <p className="mt-2 flex items-center text-[12px] font-medium text-primary">
                <Icon name="trending_up" className="mr-1 text-[14px]" />
                {d.activeMinutesDelta}
              </p>
            </div>
          </section>

          <section className="negative-space-pocket">
            <h3 className="mb-4 font-label text-label-md uppercase tracking-wider text-on-surface-variant">
              Up Next
            </h3>
            <div className="space-y-2">
              {d.upNext.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-all ${
                    item.locked ? "opacity-60" : "active:bg-surface-container"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-primary">
                    <Icon name={item.icon} />
                  </div>
                  <div className="flex-1">
                    <p className="text-body-md font-semibold text-on-surface">
                      {item.name}
                    </p>
                    <p className="font-label text-label-md text-on-surface-variant">
                      {item.detail}
                    </p>
                  </div>
                  <Icon
                    name={item.locked ? "lock" : "play_circle"}
                    className="text-outline-variant"
                  />
                </div>
              ))}
            </div>
          </section>
        </main>

        <Link
          href={`/rehab/plans/${d.planId}`}
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-lg transition-transform active:scale-90"
        >
          <Icon name="add" className="text-[32px]" />
        </Link>
      </div>

      {/* Web */}
      <div className="hidden overflow-hidden bg-background text-on-surface md:block">
        <main className="h-screen overflow-y-auto bg-background p-10">
          <div className="mx-auto max-w-app">
            <header className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-headline-lg text-on-surface">Rehab Dashboard</h2>
                <p className="text-body-lg text-on-surface-variant">
                  Track your recovery journey and daily objectives.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="rounded-lg bg-surface-container-highest p-2 text-primary hover:bg-surface-container-high"
                >
                  <Icon name="notifications" />
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-surface-container-highest p-2 text-primary hover:bg-surface-container-high"
                >
                  <Icon name="settings" />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 space-y-6 lg:col-span-7">
                <section className="relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-elevation">
                  <div className="absolute right-0 top-0 p-6">
                    <span className="rounded-full bg-primary-container px-4 py-1 font-label text-label-md text-on-primary-container">
                      Current Phase
                    </span>
                  </div>
                  <div className="flex items-start gap-6">
                    <ProgressRing percent={d.phase.percent} size={80} />
                    <div>
                      <h3 className="mb-1 text-headline-md">{d.phase.name}</h3>
                      <p className="mb-4 text-body-md text-on-surface-variant">
                        {d.phase.description}
                      </p>
                      <div className="flex gap-4">
                        <Link
                          href={`/rehab/plans/${d.planId}`}
                          className="rounded-lg bg-primary px-6 py-2 font-label text-label-md text-on-primary hover:opacity-90"
                        >
                          View Phase Details
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg border border-primary px-6 py-2 font-label text-label-md text-primary hover:bg-primary/5"
                        >
                          Phase History
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-elevation">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-headline-md">Today&apos;s Exercises</h3>
                    <span className="font-label text-label-md text-on-surface-variant">
                      Tuesday, Oct 24
                    </span>
                  </div>
                  <div className="space-y-4">
                    {d.todayExercises.map((ex) => (
                      <div
                        key={ex.id}
                        className={`flex items-center justify-between rounded-lg p-4 transition-all ${
                          ex.status === "completed"
                            ? "border border-transparent bg-surface-container-low"
                            : ex.status === "urgent"
                              ? "border border-secondary-container/30 bg-secondary-container/10"
                              : "cursor-pointer border border-outline-variant/30 bg-white hover:border-primary"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {ex.status === "completed" ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
                              <Icon name="check" className="text-[18px]" />
                            </div>
                          ) : ex.status === "urgent" ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-secondary">
                              <Icon
                                name="priority_high"
                                className="text-[18px] text-secondary"
                              />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-outline-variant" />
                          )}
                          <div>
                            <p
                              className={`font-bold ${
                                ex.status === "urgent"
                                  ? "text-secondary"
                                  : "text-on-surface"
                              }`}
                            >
                              {ex.name}
                            </p>
                            <p className="text-[12px] text-on-surface-variant">
                              {ex.detail}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-label text-label-md ${
                            ex.status === "completed"
                              ? "text-primary"
                              : "text-on-surface-variant"
                          }`}
                        >
                          {ex.status === "completed"
                            ? "Completed"
                            : ex.status === "urgent"
                              ? "Priority"
                              : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="col-span-12 space-y-6 lg:col-span-5">
                <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-elevation">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-label text-label-md text-on-surface-variant">
                      Weekly Compliance
                    </h3>
                    <span className="font-metric text-metric-xl text-primary">
                      {d.weeklyCompliance}%
                    </span>
                  </div>
                  <div className="flex h-28 items-end justify-between gap-2">
                    {d.weeklyBars.map((h, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-t-sm ${
                          i < 5 ? "bg-primary" : "bg-surface-container-high"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-tertiary/20 bg-tertiary-container p-6 text-on-tertiary-container">
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-label text-label-md text-on-primary shadow-lg transition-all hover:opacity-90"
                >
                  Open Recovery Plan
                  <Icon name="arrow_forward" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
