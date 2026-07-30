"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Icon } from "@/shared/ui/Icon";
import { OnboardingRepository } from "@/modules/onboarding/domain/OnboardingRepository";
import { MockOnboardingRepository } from "@/modules/onboarding/infrastructure/MockOnboardingRepository";
import { useOnboardingSelection } from "@/modules/onboarding/ui/hooks/useOnboardingSelection";

export function OnboardingView({
  repository,
}: { repository?: OnboardingRepository } = {}) {
  const router = useRouter();
  const activeRepository = useMemo(
    () => repository ?? new MockOnboardingRepository(),
    [repository],
  );
  const { modules, selected, toggle, loading, saved, continueNext } =
    useOnboardingSelection(activeRepository);

  useEffect(() => {
    if (saved) router.push("/rehab");
  }, [saved, router]);

  if (modules.length === 0) return null;

  const rehab = modules.find((m) => m.id === "rehab")!;
  const others = modules.filter((m) => m.id !== "rehab");

  return (
    <>
      {/* Mobile */}
      <div className="flex min-h-screen flex-col items-center overflow-x-hidden no-scrollbar lg:hidden">
        <header className="sticky top-0 z-30 flex w-full max-w-md items-center justify-between bg-background/80 px-6 py-4 backdrop-blur-md">
          <div className="flex flex-col">
            <h1 className="text-headline-md font-bold text-primary">LifeTrack OS</h1>
            <p className="font-label text-label-md text-outline">Configuración 1/3</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container">
            <Icon name="settings_account_box" className="text-primary" />
          </div>
        </header>

        <main className="flex w-full max-w-md flex-col gap-6 px-4 pb-10">
          <section className="mt-4">
            <h2 className="text-headline-lg-mobile text-on-surface">Elige tu enfoque</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Selecciona los módulos principales para personalizar tu
              santuario de salud y productividad.
            </p>
          </section>

          <div className="flex flex-col gap-4">
            {modules.map((mod) => {
              const isOn = selected.has(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggle(mod.id)}
                  className={`group relative w-full overflow-hidden rounded-xl p-6 text-left transition-all active:scale-[0.98] card-elevation ${
                    isOn
                      ? "border-2 border-primary bg-surface-container-highest"
                      : "border-2 border-transparent bg-surface-container-lowest hover:border-surface-variant"
                  }`}
                >
                  {mod.recommended && (
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-4 py-1 font-label text-label-md text-on-primary">
                      RECOMENDADO
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        isOn ? "bg-primary-container" : "bg-surface-container-high"
                      }`}
                    >
                      <Icon
                        name={mod.icon}
                        filled={mod.recommended}
                        className={`text-[28px] ${
                          isOn
                            ? "text-on-primary-container"
                            : "text-on-surface-variant"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-headline-md ${
                          isOn ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        {mod.title}
                      </h3>
                      <p className="mt-1 text-body-md text-on-surface-variant">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                  {mod.tags.length > 0 && (
                    <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
                      {mod.tags.map((tag) => (
                        <span
                          key={tag}
                          className="whitespace-nowrap rounded-full border border-primary/20 bg-white/50 px-4 py-1 font-label text-label-md text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className={`absolute bottom-4 right-4 flex h-6 w-6 items-center justify-center rounded-full ${
                      isOn
                        ? "bg-primary"
                        : "border-2 border-outline-variant"
                    }`}
                  >
                    {isOn && (
                      <Icon name="check" className="text-[18px] text-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative mt-4 h-32 w-full overflow-hidden rounded-2xl bg-surface-container">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="text-center font-label text-label-md italic text-primary">
                &quot;La salud es un estado del cuerpo. El bienestar es un estado del ser.&quot;
              </p>
            </div>
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 z-40 w-full bg-background/80 px-6 py-4 pb-10 backdrop-blur-xl">
          <button
            type="button"
            onClick={continueNext}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-6 text-headline-md text-on-primary shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {loading ? (
              <Icon name="progress_activity" className="animate-spin" />
            ) : (
              <>
                <span>Continuar</span>
                <Icon name="arrow_forward" />
              </>
            )}
          </button>
        </footer>
        <div className="h-32 w-full" />
      </div>

      {/* Web */}
      <div className="gradient-mesh hidden min-h-screen flex-col overflow-x-hidden lg:flex">
        <main className="mx-auto flex w-full max-w-app flex-grow flex-col items-center justify-center px-6 py-10">
          <header className="mb-10 max-w-2xl text-center">
            <h1 className="mb-2 text-display text-primary">
              Bienvenido a LifeTrack OS
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              Selecciona los módulos para impulsar tu santuario. Cada uno es
              una herramienta dedicada a tu salud, tus finanzas y tu enfoque.
            </p>
          </header>

          <div className="mb-10 grid w-full grid-cols-12 gap-4">
            {others.slice(0, 2).map((mod) => {
              const isOn = selected.has(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggle(mod.id)}
                  className={`col-span-12 flex flex-col justify-between rounded-xl border p-6 text-left transition-all md:col-span-4 card-elevation ${
                    isOn
                      ? "border-primary bg-surface-container-low"
                      : "border-outline-variant bg-surface-container-lowest"
                  }`}
                >
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-primary">
                      <Icon name={mod.icon} className="text-[32px]" />
                    </div>
                    <h3 className="mb-1 text-headline-md text-on-surface">
                      {mod.titleWeb}
                    </h3>
                    <p className="font-label text-label-md text-on-surface-variant">
                      {mod.descriptionWeb}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-end">
                    <Icon
                      name="check_circle"
                      filled={isOn}
                      className={isOn ? "text-primary" : "text-outline-variant"}
                    />
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => toggle(rehab.id)}
              className="relative col-span-12 overflow-hidden rounded-xl border-2 border-primary bg-primary-container p-6 text-left text-on-primary-container md:col-span-8 card-elevation"
            >
              <div className="relative z-10 flex h-full min-h-[180px]">
                <div className="flex w-1/2 flex-col justify-between">
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-lg bg-on-primary-container/20 p-2 backdrop-blur-md">
                        <Icon name="stabilization" className="text-[32px]" />
                      </div>
                      <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                        Plantilla recomendada
                      </span>
                    </div>
                    <h3 className="mb-1 text-headline-md">{rehab.titleWeb}</h3>
                    <p className="max-w-xs font-label text-label-md opacity-90">
                      {rehab.descriptionWeb}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <Icon name="check_circle" filled />
                    <span className="font-label text-label-md font-bold">
                      Activado por defecto
                    </span>
                  </div>
                </div>
                <div className="flex w-1/2 items-center justify-center">
                  <div className="relative h-full min-h-[160px] w-full overflow-hidden rounded-lg border border-white/20">
                    <Image
                      src={rehab.image!}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  </div>
                </div>
              </div>
            </button>

            {others.slice(2).map((mod) => {
              const isOn = selected.has(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggle(mod.id)}
                  className={`col-span-12 flex flex-col justify-between rounded-xl border p-6 text-left transition-all md:col-span-4 card-elevation ${
                    isOn
                      ? "border-primary bg-surface-container-low"
                      : "border-outline-variant bg-surface-container-lowest"
                  }`}
                >
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-tertiary">
                      <Icon name="lock" className="text-[32px]" />
                    </div>
                    <h3 className="mb-1 text-headline-md text-on-surface">
                      {mod.titleWeb}
                    </h3>
                    <p className="font-label text-label-md text-on-surface-variant">
                      {mod.descriptionWeb}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-end">
                    <Icon
                      name="check_circle"
                      filled={isOn}
                      className={isOn ? "text-primary" : "text-outline-variant"}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <footer className="flex w-full max-w-xl flex-col items-center gap-6">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-12 rounded-full bg-primary" />
              <div className="h-1.5 w-12 rounded-full bg-primary" />
              <div className="h-1.5 w-12 rounded-full bg-outline-variant opacity-30" />
              <div className="h-1.5 w-12 rounded-full bg-outline-variant opacity-30" />
            </div>
            <button
              type="button"
              onClick={continueNext}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 font-label text-label-md text-on-primary shadow-lg transition-all hover:bg-primary/90 active:scale-95 md:w-auto"
            >
              Continuar al panel
              <Icon name="arrow_forward" />
            </button>
            <p className="font-label text-label-md text-on-surface-variant opacity-60">
              Puedes cambiar esta configuración en cualquier momento desde las
              preferencias del sistema.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
