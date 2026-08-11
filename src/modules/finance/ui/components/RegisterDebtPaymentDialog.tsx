"use client";

import { useState } from "react";
import {
  Button,
  Combobox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@lifetrack/system-design";
import { Debt } from "@/modules/finance/domain/Debt";
import { Account } from "@/modules/finance/domain/Account";
import { formatMoney } from "@/modules/finance/domain/formatMoney";
import { RegisterDebtPaymentInput } from "@/modules/finance/domain/FinanceRepository";

export function RegisterDebtPaymentDialog({
  debt,
  open,
  onOpenChange,
  accounts,
  onSubmit,
  submitting,
  error,
}: {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  onSubmit: (input: RegisterDebtPaymentInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const eligibleAccounts = accounts.filter(
    (a) => a.currency === debt.currency,
  );
  const [amount, setAmount] = useState(
    debt.minimumPayment ? String(debt.minimumPayment) : "",
  );
  const [accountId, setAccountId] = useState(
    debt.accountId && eligibleAccounts.some((a) => a.id === debt.accountId)
      ? debt.accountId
      : eligibleAccounts[0]?.id ?? "",
  );
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setClientError(null);
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      setClientError("El monto debe ser mayor a 0.");
      return;
    }
    if (!accountId) {
      setClientError(`No tenés una cuenta en ${debt.currency} para pagar.`);
      return;
    }
    const success = await onSubmit({
      accountId,
      amount: value,
      occurredAt: new Date(occurredAt).toISOString(),
    });
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago — {debt.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-body-md text-text-3">
            Debés {formatMoney(debt.totalOwed, debt.currency)}.
          </p>
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
              <Input
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Cuenta ({debt.currency})
            </label>
            <Combobox
              options={eligibleAccounts.map((a) => ({
                value: a.id,
                label: a.name,
              }))}
              value={accountId}
              onValueChange={setAccountId}
              placeholder="Elegí una cuenta"
              emptyText={`No tenés cuentas en ${debt.currency}.`}
            />
          </div>
          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Registrando…" : "Registrar pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
