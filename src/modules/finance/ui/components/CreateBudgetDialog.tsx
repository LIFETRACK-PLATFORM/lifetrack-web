"use client";

import { useState } from "react";
import {
  Button,
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
import { Category } from "@/modules/finance/domain/Category";
import { CreateBudgetInput } from "@/modules/finance/domain/FinanceRepository";

import { formatMonthLabel } from "@/modules/finance/domain/financePeriod";

export function CreateBudgetDialog({
  categories,
  periodMonth: defaultMonth,
  periodYear: defaultYear,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  categories: Category[];
  periodMonth?: number;
  periodYear?: number;
  onClose: () => void;
  onSubmit: (input: CreateBudgetInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const expenseCategories = categories.filter((c) => c.kind === "EXPENSE");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const periodMonth = defaultMonth ?? new Date().getMonth() + 1;
  const periodYear = defaultYear ?? new Date().getFullYear();
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
    const month = periodMonth;
    const year = periodYear;
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
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo presupuesto</DialogTitle>
        </DialogHeader>

        {expenseCategories.length === 0 ? (
          <>
            <p className="text-body-md text-text-3">
              Primero creá una categoría de gasto para poder presupuestarla.
            </p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Categoría de gasto
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="!z-[60]">
                  {expenseCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Monto límite
              </label>
              <Input
                type="number"
                min={0.01}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <p className="text-body-md text-text-3">
              Período: {formatMonthLabel(periodMonth, periodYear)}
            </p>

            {(clientError || error) && (
              <p className="text-body-md text-error">{clientError ?? error}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando…" : "Crear presupuesto"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
