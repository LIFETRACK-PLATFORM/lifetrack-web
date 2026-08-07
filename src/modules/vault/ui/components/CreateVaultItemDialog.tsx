"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";

export function CreateVaultItemDialog({
  onClose,
  onSubmit,
  submitting,
  error,
  mode = "create",
  initial,
}: {
  onClose: () => void;
  onSubmit: (
    site: string,
    username: string,
    password: string,
  ) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
  mode?: "create" | "edit";
  initial?: { site: string; username: string };
}) {
  const [site, setSite] = useState(initial?.site ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!site.trim()) {
      setClientError("El sitio es obligatorio.");
      return;
    }
    if (!username.trim()) {
      setClientError("El usuario es obligatorio.");
      return;
    }
    if (!password.trim()) {
      setClientError("La contraseña es obligatoria.");
      return;
    }

    const success = await onSubmit(site.trim(), username.trim(), password);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            {mode === "create" ? "Nueva contraseña" : "Editar contraseña"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-3"
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Sitio
            </label>
            <input
              type="text"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              placeholder="Ej. github.com"
            />
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              placeholder="Ej. tu@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 pr-10 text-body-md text-text-1 focus:border-primary focus:outline-none"
                placeholder="Contraseña del sitio"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-3 hover:text-text-1"
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} />
              </button>
            </div>
          </div>

          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-label text-label-md text-text-3 hover:bg-surface-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
            >
              {submitting
                ? "Guardando…"
                : mode === "create"
                  ? "Guardar"
                  : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
