"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Label } from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
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
    <main className="relative flex min-h-dvh w-full items-center justify-center bg-surface px-5 pb-safe pt-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
        <div className="flex flex-col items-center gap-4 text-center">
          {!token || error ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-error/10 ">
                <Icon
                  name="error"
                  filled
                  className="text-[32px] text-error"
                />
              </div>
              <h2 className="text-headline-md font-semibold text-text-1">
                No se pudo confirmar el email
              </h2>
              <p
                role="alert"
                className="rounded-lg bg-error/10 px-4 py-3 text-body-md text-error"
              >
                {!token
                  ? "Este enlace de confirmación no es válido."
                  : error}
              </p>

              {resendSuccess ? (
                <p
                  role="status"
                  className="rounded-lg bg-primary px-4 py-3 text-body-md text-primary-foreground"
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
                    <Label
                      className="font-label px-1 text-label-md text-text-3"
                      htmlFor="resend-email"
                    >
                      Reenviar verificación
                    </Label>
                    <div className="relative">
                      <Icon
                        name="mail"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
                      />
                      <Input
                        id="resend-email"
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="h-12 pl-12"
                      />
                    </div>
                  </div>
                  {resendError && (
                    <p
                      role="alert"
                      className="rounded-lg bg-error/10 px-4 py-3 text-body-md text-error"
                    >
                      {resendError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="mt-2 h-12 w-full"
                    disabled={resendLoading}
                  >
                    {resendLoading ? "Enviando…" : "Reenviar verificación"}
                  </Button>
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
              <h2 className="text-headline-md font-semibold text-text-1">
                Email confirmado
              </h2>
              <p className="text-body-md text-text-3">
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
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary ">
                <Icon
                  name="mail"
                  filled
                  className="text-[32px] text-primary-foreground"
                />
              </div>
              <h2 className="text-headline-md font-semibold text-text-1">
                Confirmando tu email…
              </h2>
              <p className="text-body-md text-text-3">
                {loading ? "Un momento por favor." : "Preparando la confirmación."}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
