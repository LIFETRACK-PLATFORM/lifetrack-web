"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lifetrack/system-design";
import { AccountType } from "@/modules/finance/domain/Account";
import {
  AccountCurrency,
  CreateAccountInput,
} from "@/modules/finance/domain/FinanceRepository";

const CURRENCIES: { value: AccountCurrency; label: string }[] = [
  { value: "PEN", label: "PEN — Soles" },
  { value: "USD", label: "USD — Dólares" },
];

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "BANK", label: "Banco" },
  { value: "CARD", label: "Tarjeta" },
  { value: "OTHER", label: "Otro" },
];

export function CreateAccountDialog({
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (input: CreateAccountInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("BANK");
  const [currency, setCurrency] = useState<AccountCurrency>("PEN");
  const [initialBalance, setInitialBalance] = useState("0");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!name.trim()) {
      setClientError("El nombre de la cuenta es obligatorio.");
      return;
    }
    const balance = Number(initialBalance);
    if (Number.isNaN(balance) || balance < 0) {
      setClientError("El balance inicial debe ser un número mayor o igual a 0.");
      return;
    }

    const success = await onSubmit({
      name: name.trim(),
      type,
      currency,
      initialBalance: balance,
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Nueva cuenta
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
              placeholder="Ej. Ahorros"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Tipo
              </label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as AccountType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Moneda
              </label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as AccountCurrency)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Balance inicial
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
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
              {submitting ? "Guardando…" : "Crear cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
