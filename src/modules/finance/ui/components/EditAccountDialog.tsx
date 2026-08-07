"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { Account, AccountType } from "@/modules/finance/domain/Account";
import {
  AccountCurrency,
  UpdateAccountInput,
} from "@/modules/finance/domain/FinanceRepository";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "BANK", label: "Banco" },
  { value: "CARD", label: "Tarjeta" },
  { value: "OTHER", label: "Otro" },
];

const CURRENCIES: { value: AccountCurrency; label: string }[] = [
  { value: "PEN", label: "PEN — Soles" },
  { value: "USD", label: "USD — Dólares" },
];

export function EditAccountDialog({
  account,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  account: Account;
  onClose: () => void;
  onSubmit: (input: UpdateAccountInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [currency, setCurrency] = useState<AccountCurrency>(
    account.currency as AccountCurrency,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    if (!name.trim()) {
      setClientError("El nombre es obligatorio.");
      return;
    }
    const success = await onSubmit({ name: name.trim(), type, currency });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Editar cuenta
          </h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-3">
            <Icon name="close" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as AccountType)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none">
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as AccountCurrency)} className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none">
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
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
