"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { Account } from "@/modules/finance/domain/Account";
import { Category } from "@/modules/finance/domain/Category";
import { TransactionKind } from "@/modules/finance/domain/Transaction";
import { CreateTransactionInput } from "@/modules/finance/domain/FinanceRepository";

export function CreateTransactionDialog({
  accounts,
  categories,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (input: CreateTransactionInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<TransactionKind>("EXPENSE");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!accountId) {
      setClientError("Elegí una cuenta.");
      return;
    }
    if (!categoryId) {
      setClientError("Elegí una categoría.");
      return;
    }
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      setClientError("El monto debe ser un número mayor a 0.");
      return;
    }

    const success = await onSubmit({
      accountId,
      categoryId,
      amount: value,
      kind,
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
            Nueva transacción
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Cuenta
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              Descripción (opcional)
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
              {submitting ? "Guardando…" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
