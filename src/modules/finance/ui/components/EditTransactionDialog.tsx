"use client";

import { useState } from "react";
import {
  Button,
  DatePicker,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@lifetrack/system-design";
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
  const [occurredAt, setOccurredAt] = useState<Date | undefined>(
    new Date(transaction.occurredAt),
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
      occurredAt: (occurredAt ?? new Date()).toISOString(),
    });
    if (success) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar transacción</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Monto
              </label>
              <Input
                type="number"
                min={0.01}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Fecha
              </label>
              <DatePicker value={occurredAt} onValueChange={setOccurredAt} />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Descripción
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
