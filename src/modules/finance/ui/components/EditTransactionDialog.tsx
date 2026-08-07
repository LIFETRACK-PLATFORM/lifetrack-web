"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { Transaction } from "@/modules/finance/domain/Transaction";
import { UpdateTransactionInput } from "@/modules/finance/domain/FinanceRepository";

export function EditTransactionDialog({
  transaction,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  transaction: Transaction;
  onClose: () => void;
  onSubmit: (input: UpdateTransactionInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [amount, setAmount] = useState(String(transaction.amount));
  const [description, setDescription] = useState(transaction.description ?? "");
  const [occurredAt, setOccurredAt] = useState(
    transaction.occurredAt.slice(0, 10),
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      setClientError("El monto debe ser un número mayor a 0.");
      return;
    }
    const success = await onSubmit({
      amount: value,
      description: description.trim() || undefined,
      occurredAt: new Date(occurredAt).toISOString(),
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Editar transacción
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Monto
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
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Fecha
              </label>
              <input
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
            />
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
              {submitting ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
