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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lifetrack/system-design";
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
  const [occurredAt, setOccurredAt] = useState<Date | undefined>(new Date());
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
      occurredAt: (occurredAt ?? new Date()).toISOString(),
    });
    if (success) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva transacción</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Tipo
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={kind === "EXPENSE" ? "default" : "secondary"}
                className="flex-1"
                onClick={() => setKind("EXPENSE")}
              >
                Gasto
              </Button>
              <Button
                type="button"
                variant={kind === "INCOME" ? "default" : "secondary"}
                className="flex-1"
                onClick={() => setKind("INCOME")}
              >
                Ingreso
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Cuenta
              </label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Categoría
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              Descripción (opcional)
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
              {submitting ? "Guardando…" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
