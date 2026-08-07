"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/shared/ui/Icon";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { AuthRepository } from "@/modules/auth/domain/AuthRepository";
import { MockAuthRepository } from "@/modules/auth/infrastructure/MockAuthRepository";
import { useLinkAccount } from "@/modules/auth/ui/hooks/useLinkAccount";

const PROVIDER_LABELS: Record<string, string> = {
  GOOGLE: "Google",
  GITHUB: "GitHub",
};

export function LinkAccountView({
  repository,
}: { repository?: AuthRepository } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkToken = searchParams.get("linkToken") ?? "";
  const provider = (searchParams.get("provider") ?? "").toUpperCase();
  const activeRepository = useMemo(
    () => repository ?? new MockAuthRepository(),
    [repository],
  );
  const { loading, success, error, linkAccount } =
    useLinkAccount(activeRepository);

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => router.push("/onboarding"), 900);
    return () => clearTimeout(timeout);
  }, [success, router]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    linkAccount(provider, linkToken, password);
  }

  if (!linkToken || !provider) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <div className="w-full max-w-md rounded-xl border border-border/30 bg-surface-1 p-6 text-center">
          <p className="text-body-md text-error">
            El enlace de vinculación no es válido.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block font-label text-label-md font-bold text-primary hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  const providerLabel = PROVIDER_LABELS[provider] ?? provider;

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-5 pb-safe pt-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-xl border border-border/30 bg-surface-1 p-6 card-elevation">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Icon name="link" filled className="text-[28px] text-primary-foreground" />
          </div>
          <h1 className="text-headline-md font-semibold text-text-1">
            Vincular cuenta
          </h1>
          <p className="mt-2 text-body-md text-text-3">
            Ya existe una cuenta local con el mismo email. Confirma tu contraseña
            para vincular {providerLabel} a tu cuenta de LifeTrack.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label
              className="font-label px-1 text-label-md text-text-3"
              htmlFor="password"
            >
              Contraseña de tu cuenta local
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="h-12"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-error/10 px-4 py-3 text-body-md text-error"
            >
              {error}
            </p>
          )}

          <Button type="submit" className="h-12 w-full" disabled={loading}>
            {loading ? "Vinculando…" : "Confirmar vinculación"}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-md text-text-3">
          <Link href="/login" className="font-bold text-primary hover:underline">
            Cancelar
          </Link>
        </p>
      </div>

      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-2/60">
          <div className="flex flex-col items-center rounded-full bg-surface-1 p-10">
            <Icon name="check_circle" filled className="text-[64px] text-primary" />
          </div>
        </div>
      )}
    </main>
  );
}
