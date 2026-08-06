"use client";

import Link from "next/link";
import { FormEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/shared/ui/Icon";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
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
    <main className="relative flex min-h-dvh w-full items-center justify-center bg-surface px-5 pb-safe pt-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary ">
            <Icon
              name="mail"
              filled
              className="text-[32px] text-primary-foreground"
            />
          </div>
          <h2 className="text-headline-md font-semibold text-text-1">
            Restablece tu contraseña
          </h2>
          <p className="mt-1 font-label text-label-md text-text-3">
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
            <p className="text-body-md text-text-3">
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
                <Label
                  className="font-label px-1 text-label-md text-text-3"
                  htmlFor="forgot-password-email"
                >
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Icon
                    name="mail"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
                  />
                  <Input
                    id="forgot-password-email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="h-12 pl-12"
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-error/10 px-4 py-3 text-body-md text-error"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="mt-2 h-12 w-full"
                disabled={loading}
              >
                {loading ? "Enviando…" : "Enviar enlace"}
                <Icon name="arrow_forward" />
              </Button>
            </form>

            <p className="mt-8 text-center text-body-md text-text-3">
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
