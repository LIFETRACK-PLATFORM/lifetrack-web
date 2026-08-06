"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/shared/ui/Icon";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { loginAvatars, loginHeroImage } from "@/modules/auth/infrastructure/content/loginContent";
import { AuthRepository } from "@/modules/auth/domain/AuthRepository";
import { MockAuthRepository } from "@/modules/auth/infrastructure/MockAuthRepository";
import { useRegister } from "@/modules/auth/ui/hooks/useRegister";

export function RegisterView({ repository }: { repository?: AuthRepository } = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const activeRepository = useMemo(
    () => repository ?? new MockAuthRepository(),
    [repository],
  );
  const { loading, success, error, register } = useRegister(activeRepository);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setMatchError("Las contraseñas no coinciden");
      return;
    }
    setMatchError(null);
    register(name, email, password);
  }

  const displayError = matchError ?? error;

  if (success) {
    return (
      <main className="relative flex min-h-dvh w-full items-center justify-center bg-surface px-5 pb-safe pt-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary ">
              <Icon
                name="mail"
                filled
                className="text-[32px] text-primary-foreground"
              />
            </div>
            <h2 className="text-headline-md font-semibold text-text-1">
              Revisa tu correo
            </h2>
            <p className="text-body-md text-text-3">
              Te enviamos un enlace de confirmación. Ábrelo para activar tu
              cuenta antes de iniciar sesión.
            </p>
            <Link
              href="/login"
              className="font-label text-label-md font-bold text-primary hover:underline"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Mobile layout */}
      <main className="relative z-10 flex min-h-dvh flex-col overflow-x-hidden px-5 pb-safe pt-10 lg:hidden">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-24 top-1/2 h-64 w-64 rounded-full bg-accent-tint/5 blur-3xl" />
        </div>

        <header className="relative z-10 mb-8 flex shrink-0 flex-col items-center text-center">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary ">
            <Icon
              name="stabilization"
              filled
              className="text-[32px] text-primary-foreground"
            />
          </div>
          <h1 className="text-headline-lg-mobile font-bold tracking-tight text-primary">
            LifeTrack OS
          </h1>
          <p className="mt-1 text-body-md text-text-3">
            Impulsando tu salud y productividad
          </p>
        </header>

        <section className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="w-full rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
            <div className="mb-6">
              <h2 className="text-headline-md font-semibold text-text-1">
                Crea tu cuenta
              </h2>
              <p className="font-label text-label-md text-text-3">
                Empieza a seguir tu progreso hoy
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="name-mobile"
                >
                  Nombre completo
                </Label>
                <div className="relative">
                  <Icon
                    name="person"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
                  />
                  <Input
                    id="name-mobile"
                    name="name"
                    type="text"
                    required
                    placeholder="Juana Pérez"
                    className="h-12 pl-12"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="email-mobile"
                >
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Icon
                    name="mail"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
                  />
                  <Input
                    id="email-mobile"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="h-12 pl-12"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="password-mobile"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Icon
                    name="lock"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
                  />
                  <Input
                    id="password-mobile"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="h-12 pl-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-3"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Icon name={showPassword ? "visibility_off" : "visibility"} />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="confirm-password-mobile"
                >
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Icon
                    name="lock"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
                  />
                  <Input
                    id="confirm-password-mobile"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="h-12 pl-12"
                  />
                </div>
              </div>
              {displayError && (
                <p
                  role="alert"
                  className="rounded-lg bg-error/10 px-4 py-3 text-body-md text-error"
                >
                  {displayError}
                </p>
              )}
              <Button
                type="submit"
                className="mt-2 h-12 w-full"
                disabled={loading}
              >
                {loading ? "Creando cuenta…" : "Crear cuenta"}
                <Icon name="arrow_forward" />
              </Button>
            </form>
          </div>

          <p className="mt-10 text-center text-body-md text-text-3">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </section>

        <footer className="relative z-10 mt-auto pb-2 pt-6 text-center">
          <div className="flex justify-center gap-4 font-label text-label-md text-text-3">
            <span>Política de privacidad</span>
            <span>•</span>
            <span>Términos de servicio</span>
          </div>
          <p className="mt-2 font-label text-label-md text-text-3 opacity-60">
            © 2026 LifeTrack OS
          </p>
        </footer>
      </main>

      {/* Desktop / Web layout */}
      <main className="hidden min-h-screen w-full lg:flex">
        <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-surface-1 lg:flex">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url('${loginHeroImage}')` }}
          />
          <div className="relative z-10 mx-4 max-w-md rounded-xl border border-white/20 p-10 glass-card">
            <div className="mb-6">
              <span className="text-headline-md font-bold text-primary">
                LifeTrack OS
              </span>
            </div>
            <h1 className="mb-4 text-headline-lg text-text-1">
              Domina tu salud y productividad.
            </h1>
            <p className="text-body-lg text-text-3">
              Tu santuario de datos personal. Sincroniza métricas, gestiona
              tus metas de rehabilitación y encuentra tu flujo diario con
              precisión de grado médico.
            </p>
            <div className="mt-10 flex gap-4">
              <div className="flex -space-x-md">
                {loginAvatars.map((src) => (
                  <Image
                    key={src.slice(-20)}
                    src={src}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-label text-label-md font-bold text-text-1">
                  +12 mil miembros
                </p>
                <p className="text-[12px] text-text-3">
                  Siguiendo su recuperación a diario
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-surface px-4 lg:w-1/2">
          <div className="flex w-full max-w-[440px] flex-col">
            <div className="mb-10 flex items-start justify-between">
              <div className="flex flex-col">
                <h2 className="mb-1 text-headline-lg text-text-1">Crea tu cuenta</h2>
                <p className="text-body-md text-text-3">
                  Empieza tu camino de salud y productividad.
                </p>
              </div>
              <ThemeToggle />
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="name-web"
                >
                  Nombre completo
                </Label>
                <Input
                  id="name-web"
                  name="name"
                  type="text"
                  required
                  placeholder="Juana Pérez"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="email-web"
                >
                  Correo electrónico
                </Label>
                <Input
                  id="email-web"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="password-web"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password-web"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-text-3"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Icon name={showPassword ? "visibility_off" : "visibility"} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="confirm-password-web"
                >
                  Confirmar contraseña
                </Label>
                <Input
                  id="confirm-password-web"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
              </div>
              {displayError && (
                <p
                  role="alert"
                  className="rounded-lg bg-error/10 px-4 py-3 text-body-md text-error"
                >
                  {displayError}
                </p>
              )}
              <Button
                type="submit"
                className="mt-2 h-12 w-full"
                disabled={loading}
              >
                {loading ? "Creando cuenta…" : "Crear cuenta"}
              </Button>
            </form>

            <p className="mt-10 text-center text-body-md text-text-3">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="font-bold text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
