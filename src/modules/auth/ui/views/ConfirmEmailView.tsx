"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { AuthRepository } from "@/modules/auth/domain/AuthRepository";
import { MockAuthRepository } from "@/modules/auth/infrastructure/MockAuthRepository";
import { useConfirmEmail } from "@/modules/auth/ui/hooks/useConfirmEmail";
import { useResendVerification } from "@/modules/auth/ui/hooks/useResendVerification";

export function ConfirmEmailView({
  repository,
  token,
}: {
  repository?: AuthRepository;
  token: string;
}) {
  const activeRepository = useMemo(
    () => repository ?? new MockAuthRepository(),
    [repository],
  );
  const { loading, success, error, confirmEmail } =
    useConfirmEmail(activeRepository);
  const {
    loading: resendLoading,
    success: resendSuccess,
    error: resendError,
    resendVerification,
  } = useResendVerification(activeRepository);
  const [resendEmail, setResendEmail] = useState("");
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token || hasRequested.current) return;
    hasRequested.current = true;
    confirmEmail(token);
    // Se ejecuta una sola vez: confirmar el token es una operación de un
    // solo uso, no algo que deba repetirse si confirmEmail cambia de identidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-surface px-5 pb-safe pt-10">
      <div className="w-full max-w-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 card-elevation">
        <div className="flex flex-col items-center gap-4 text-center">
          {!token || error ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-error-container shadow-sm">
                <Icon
                  name="error"
                  filled
                  className="text-[32px] text-on-error-container"
                />
              </div>
              <h2 className="text-headline-md font-semibold text-on-surface">
                No se pudo confirmar el email
              </h2>
              <p
                role="alert"
                className="rounded-lg bg-error-container px-4 py-3 text-body-md text-on-error-container"
              >
                {!token
                  ? "Este enlace de confirmación no es válido."
                  : error}
              </p>

              {resendSuccess ? (
                <p
                  role="status"
                  className="rounded-lg bg-primary-container px-4 py-3 text-body-md text-on-primary-container"
                >
                  Si el email existe, te enviamos un nuevo enlace de
                  confirmación.
                </p>
              ) : (
                <form
                  className="w-full space-y-3 text-left"
                  onSubmit={(e) => {
                    e.preventDefault();
                    resendVerification(resendEmail);
                  }}
                >
                  <div className="space-y-1">
                    <label
                      className="font-label px-1 text-label-md text-on-surface-variant"
                      htmlFor="resend-email"
                    >
                      Reenviar verificación
                    </label>
                    <div className="relative">
                      <Icon
                        name="mail"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
                      />
                      <input
                        id="resend-email"
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-3 pl-[48px] pr-4 text-body-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  {resendError && (
                    <p
                      role="alert"
                      className="rounded-lg bg-error-container px-4 py-3 text-body-md text-on-error-container"
                    >
                      {resendError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full rounded-xl bg-primary-container py-3 text-label-lg font-bold text-on-primary-container card-elevation transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
                  >
                    {resendLoading ? "Enviando…" : "Reenviar verificación"}
                  </button>
                </form>
              )}

              <Link
                href="/login"
                className="font-label text-label-md font-bold text-primary hover:underline"
              >
                Ir a iniciar sesión
              </Link>
            </>
          ) : success ? (
            <>
              <Icon
                name="check_circle"
                filled
                className="text-[48px] text-primary"
              />
              <h2 className="text-headline-md font-semibold text-on-surface">
                Email confirmado
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Tu cuenta ya está activa. Ahora puedes iniciar sesión.
              </p>
              <Link
                href="/login"
                className="font-label text-label-md font-bold text-primary hover:underline"
              >
                Ir a iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container shadow-sm">
                <Icon
                  name="mail"
                  filled
                  className="text-[32px] text-on-primary-container"
                />
              </div>
              <h2 className="text-headline-md font-semibold text-on-surface">
                Confirmando tu email…
              </h2>
              <p className="text-body-md text-on-surface-variant">
                {loading ? "Un momento por favor." : "Preparando la confirmación."}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
