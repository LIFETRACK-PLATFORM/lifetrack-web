"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { Category } from "@/modules/finance/domain/Category";
import { CreateBudgetInput } from "@/modules/finance/domain/FinanceRepository";

const now = new Date();

export function CreateBudgetDialog({
  categories,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  categories: Category[];
  onClose: () => void;
  onSubmit: (input: CreateBudgetInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const expenseCategories = categories.filter((c) => c.kind === "EXPENSE");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [periodMonth, setPeriodMonth] = useState(String(now.getMonth() + 1));
  const [periodYear, setPeriodYear] = useState(String(now.getFullYear()));
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!categoryId) {
      setClientError("Elegí una categoría de gasto.");
      return;
    }
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      setClientError("El monto debe ser un número mayor a 0.");
      return;
    }
    const month = Number(periodMonth);
    const year = Number(periodYear);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setClientError("El mes debe estar entre 1 y 12.");
      return;
    }

    const success = await onSubmit({
      categoryId,
      amount: value,
      periodMonth: month,
      periodYear: year,
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Nuevo presupuesto
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-3"
          >
            <Icon name="close" />
          </button>
        </div>

        {expenseCategories.length === 0 ? (
          <p className="text-body-md text-text-3">
            Primero creá una categoría de gasto para poder presupuestarla.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Categoría de gasto
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Monto límite
              </label>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-label text-label-md text-text-3">
                  Mes
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-label text-label-md text-text-3">
                  Año
                </label>
                <input
                  type="number"
                  min={2000}
                  value={periodYear}
                  onChange={(e) => setPeriodYear(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
                />
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
                {submitting ? "Guardando…" : "Crear presupuesto"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
