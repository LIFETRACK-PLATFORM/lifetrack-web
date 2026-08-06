"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { CategoryKind } from "@/modules/finance/domain/Category";
import { CreateCategoryInput } from "@/modules/finance/domain/FinanceRepository";

export function CreateCategoryDialog({
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (input: CreateCategoryInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CategoryKind>("EXPENSE");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!name.trim()) {
      setClientError("El nombre de la categoría es obligatorio.");
      return;
    }

    const success = await onSubmit({ name: name.trim(), kind });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Nueva categoría
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
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              placeholder="Ej. Comida"
            />
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKind("EXPENSE")}
                className={`flex-1 rounded-lg py-2 font-label text-label-md transition-colors ${
                  kind === "EXPENSE"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-3 text-text-3 hover:bg-surface-4"
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setKind("INCOME")}
                className={`flex-1 rounded-lg py-2 font-label text-label-md transition-colors ${
                  kind === "INCOME"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-3 text-text-3 hover:bg-surface-4"
                }`}
              >
                Ingreso
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
              {submitting ? "Guardando…" : "Crear categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
