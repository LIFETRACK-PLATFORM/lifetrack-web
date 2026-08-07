"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { BudgetListItem } from "@/modules/finance/domain/BudgetListItem";
import { UpdateBudgetInput } from "@/modules/finance/domain/FinanceRepository";

export function EditBudgetDialog({
  budget,
  categoryName,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  budget: BudgetListItem;
  categoryName: string;
  onClose: () => void;
  onSubmit: (input: UpdateBudgetInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [amount, setAmount] = useState(String(budget.amount));
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      setClientError("El monto debe ser mayor a 0.");
      return;
    }
    const success = await onSubmit({ amount: value });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">Editar presupuesto</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-3">
            <Icon name="close" />
          </button>
        </div>
        <p className="mb-4 text-body-md text-text-3">Categoría: {categoryName}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">Monto mensual</label>
            <input type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none" />
          </div>
          {(clientError || error) && <p className="text-body-md text-error">{clientError ?? error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-label text-label-md text-text-3 hover:bg-surface-3">Cancelar</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground disabled:opacity-60">{submitting ? "Guardando…" : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
