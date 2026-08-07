"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { RecurringItem } from "@/modules/finance/domain/RecurringItem";
import { Account } from "@/modules/finance/domain/Account";
import { formatMoney } from "@/modules/finance/domain/formatMoney";

export function PendingRemindersBanner({
  reminders,
  accounts,
  onRegister,
  onDismiss,
}: {
  reminders: RecurringItem[];
  accounts: Account[];
  onRegister: (item: RecurringItem, amount: number) => Promise<void>;
  onDismiss: (itemId: string) => void;
}) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  if (reminders.length === 0) return null;

  const currency = (accountId: string) =>
    accounts.find((a) => a.id === accountId)?.currency ?? "PEN";

  return (
    <section className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="notifications" className="text-primary" />
        <h3 className="font-label text-label-md font-bold text-text-1">
          Pendientes del mes
        </h3>
      </div>
      <div className="space-y-3">
        {reminders.map((item) => (
          <div
            key={item.recurringItemId}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border/30 bg-surface-1 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-body-md font-semibold text-text-1">
                {item.name}
              </p>
              <p className="font-label text-label-md text-text-3">
                Sugerido: {formatMoney(item.amount, currency(item.accountId))}
              </p>
            </div>
            <input
              type="number"
              min={0.01}
              step="0.01"
              value={amounts[item.recurringItemId] ?? String(item.amount)}
              onChange={(e) =>
                setAmounts((prev) => ({
                  ...prev,
                  [item.recurringItemId]: e.target.value,
                }))
              }
              className="w-28 rounded-lg border border-border bg-surface-1 px-2 py-1.5 text-body-md text-text-1"
            />
            <button
              type="button"
              disabled={submitting === item.recurringItemId}
              onClick={async () => {
                setSubmitting(item.recurringItemId);
                try {
                  const raw =
                    amounts[item.recurringItemId] ?? String(item.amount);
                  await onRegister(item, Number(raw));
                  onDismiss(item.recurringItemId);
                } finally {
                  setSubmitting(null);
                }
              }}
              className="rounded-lg bg-primary px-3 py-1.5 font-label text-label-md text-primary-foreground disabled:opacity-60"
            >
              {submitting === item.recurringItemId ? "…" : "Registrar"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
