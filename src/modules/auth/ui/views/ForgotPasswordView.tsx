"use client";

import Link from "next/link";
import { FormEvent, useMemo } from "react";
import { Icon } from "@/shared/ui/Icon";
import { AuthRepository } from "@/modules/auth/domain/AuthRepository";
import { MockAuthRepository } from "@/modules/auth/infrastructure/MockAuthRepository";
import { useForgotPassword } from "@/modules/auth/ui/hooks/useForgotPassword";

export function ForgotPasswordView({
  repository,
}: { repository?: AuthRepository } = {}) {
  const activeRepository = useMemo(
    () => repository ?? new MockAuthRepository(),
    [repository],
  );
  const { loading, success, error, requestReset } =
    useForgotPassword(activeRepository);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    requestReset(email);
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-surface px-5 pb-safe pt-10">
      <div className="w-full max-w-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-elevation">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container shadow-sm">
            <Icon
              name="mail"
              filled
              className="text-[32px] text-on-primary-container"
            />
          </div>
          <h2 className="text-headline-md font-semibold text-on-surface">
            Restablece tu contraseña
          </h2>
          <p className="mt-1 font-label text-label-md text-on-surface-variant">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Icon
              name="check_circle"
              filled
              className="text-[48px] text-primary"
            />
            <p className="text-body-md text-on-surface-variant">
              Si existe una cuenta con ese correo, te enviamos un enlace para
              restablecer tu contraseña.
            </p>
            <Link
              href="/login"
              className="font-label text-label-md font-bold text-primary hover:underline"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  className="font-label px-1 text-label-md text-on-surface-variant"
                  htmlFor="forgot-password-email"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Icon
                    name="mail"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
                  />
                  <input
                    id="forgot-password-email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full border-b border-outline-variant bg-surface-container-low py-4 pl-[48px] pr-4 text-body-md transition-all duration-200 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-error-container px-4 py-3 text-body-md text-on-error-container"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-4 text-headline-md text-on-primary-container shadow-lg transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              >
                {loading ? "Enviando…" : "Enviar enlace"}
                <Icon name="arrow_forward" />
              </button>
            </form>

            <p className="mt-8 text-center text-body-md text-on-surface-variant">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href="/login"
                className="font-bold text-primary hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
