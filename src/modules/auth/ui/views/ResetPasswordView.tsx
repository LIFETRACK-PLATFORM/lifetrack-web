"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Icon } from "@/shared/ui/Icon";
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
    <main className="flex min-h-dvh w-full items-center justify-center bg-surface px-5 pb-safe pt-10">
      <div className="w-full max-w-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-elevation">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container shadow-sm">
            <Icon
              name="lock"
              filled
              className="text-[32px] text-on-primary-container"
            />
          </div>
          <h2 className="text-headline-md font-semibold text-on-surface">
            Elige una nueva contraseña
          </h2>
          <p className="mt-1 font-label text-label-md text-on-surface-variant">
            Ingresa y confirma tu nueva contraseña abajo.
          </p>
        </div>

        {!token ? (
          <p
            role="alert"
            className="rounded-lg bg-error-container px-4 py-3 text-center text-body-md text-on-error-container"
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
            <p className="text-body-md text-on-surface-variant">
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
              <label
                className="font-label px-1 text-label-md text-on-surface-variant"
                htmlFor="reset-new-password"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
                />
                <input
                  id="reset-new-password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full border-b border-outline-variant bg-surface-container-low py-4 pl-[48px] pr-4 text-body-md transition-all duration-200 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="font-label px-1 text-label-md text-on-surface-variant"
                htmlFor="reset-confirm-password"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <Icon
                  name="lock"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
                />
                <input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full border-b border-outline-variant bg-surface-container-low py-4 pl-[48px] pr-4 text-body-md transition-all duration-200 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {displayError && (
              <p
                role="alert"
                className="rounded-lg bg-error-container px-4 py-3 text-body-md text-on-error-container"
              >
                {displayError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-4 text-headline-md text-on-primary-container shadow-lg transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              {loading ? "Restableciendo…" : "Restablecer contraseña"}
              <Icon name="arrow_forward" />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
