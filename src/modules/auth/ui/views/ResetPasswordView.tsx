"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Button, Input, Label } from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { AuthRepository } from "@/modules/auth/domain/AuthRepository";
import { MockAuthRepository } from "@/modules/auth/infrastructure/MockAuthRepository";
import { useResetPassword } from "@/modules/auth/ui/hooks/useResetPassword";

export function ResetPasswordView({
  repository,
  token,
}: {
  repository?: AuthRepository;
  token: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const activeRepository = useMemo(
    () => repository ?? new MockAuthRepository(),
    [repository],
  );
  const { loading, success, error, resetPassword } =
    useResetPassword(activeRepository);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setMatchError("Las contraseñas no coinciden");
      return;
    }
    setMatchError(null);
    resetPassword(token, newPassword);
  }

  const displayError = matchError ?? error;

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center bg-surface px-5 pb-safe pt-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary ">
            <Icon
              name="lock"
              filled
              className="text-[32px] text-primary-foreground"
            />
          </div>
          <h2 className="text-headline-md font-semibold text-text-1">
            Elige una nueva contraseña
          </h2>
          <p className="mt-1 font-label text-label-md text-text-3">
            Ingresa y confirma tu nueva contraseña abajo.
          </p>
        </div>

        {!token ? (
          <p
            role="alert"
            className="rounded-lg bg-error/10 px-4 py-3 text-center text-body-md text-error"
          >
            Este enlace de restablecimiento no es válido o ya expiró. Solicita
            uno nuevo desde la página de{" "}
            <Link href="/forgot-password" className="font-bold underline">
              contraseña olvidada
            </Link>
            .
          </p>
        ) : success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Icon
              name="check_circle"
              filled
              className="text-[48px] text-primary"
            />
            <p className="text-body-md text-text-3">
              Tu contraseña fue restablecida. Ahora puedes iniciar sesión con
              tu nueva contraseña.
            </p>
            <Link
              href="/login"
              className="font-label text-label-md font-bold text-primary hover:underline"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label
                className="font-label px-1 text-label-md text-text-3"
                htmlFor="reset-new-password"
              >
                Nueva contraseña
              </Label>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
                />
                <Input
                  id="reset-new-password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
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
                htmlFor="reset-confirm-password"
              >
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
                />
                <Input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
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
              {loading ? "Restableciendo…" : "Restablecer contraseña"}
              <Icon name="arrow_forward" />
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
