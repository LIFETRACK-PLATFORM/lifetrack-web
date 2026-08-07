"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";

export function UnlockVaultDialog({
  onUnlock,
  unlocking,
  error,
}: {
  onUnlock: (masterPassword: string) => Promise<boolean>;
  unlocking: boolean;
  error: string | null;
}) {
  const [masterPassword, setMasterPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!masterPassword.trim()) {
      setClientError("Ingresá tu contraseña maestra.");
      return;
    }
    if (masterPassword.length < 8) {
      setClientError("La contraseña maestra debe tener al menos 8 caracteres.");
      return;
    }

    const success = await onUnlock(masterPassword);
    if (success) setMasterPassword("");
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6 card-elevation">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-3 text-primary">
          <Icon name="encrypted" className="text-[28px]" />
        </div>
        <div>
          <h3 className="text-headline-md font-semibold text-text-1">
            Desbloquear bóveda
          </h3>
          <p className="font-label text-label-md text-text-3">
            Zero-knowledge: tus secretos nunca salen cifrados del dispositivo.
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
        <p className="text-body-md text-text-2">
          <strong className="text-warning">Importante:</strong> si olvidás tu
          contraseña maestra, no hay forma de recuperar tus contraseñas
          guardadas. No podemos restablecerla por vos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Contraseña maestra
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 pr-10 text-body-md text-text-1 focus:border-primary focus:outline-none"
              placeholder="Tu contraseña maestra"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-3 hover:text-text-1"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} />
            </button>
          </div>
        </div>

        {(clientError || error) && (
          <p className="text-body-md text-error">{clientError ?? error}</p>
        )}

        <button
          type="submit"
          disabled={unlocking}
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-label text-label-md text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
        >
          {unlocking ? "Desbloqueando…" : "Desbloquear bóveda"}
        </button>
      </form>

      <div className="mt-4 border-t border-border pt-4 text-center">
        <Link
          href="/rehab"
          className="inline-flex items-center gap-1 font-label text-label-md text-text-3 transition-colors hover:text-primary"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          Volver sin desbloquear
        </Link>
      </div>
    </div>
  );
}
