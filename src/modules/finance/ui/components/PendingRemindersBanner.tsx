"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
} from "@lifetrack/system-design";
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
    <Alert variant="primary">
      <Bell className="size-4" />
      <AlertTitle>Pendientes del mes</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-3">
          {reminders.map((item) => (
            <div
              key={item.recurringItemId}
              className="flex flex-wrap items-center gap-3"
            >
              <div className="min-w-0 flex-1 text-text-1">
                <span className="font-semibold">{item.name}</span>
                <span className="text-text-3">
                  {" "}
                  · sugerido{" "}
                  {formatMoney(item.amount, currency(item.accountId))}
                </span>
              </div>
              <Input
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
                className="w-[88px]"
                aria-label={`Monto para ${item.name}`}
              />
              <Button
                size="sm"
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
              >
                {submitting === item.recurringItemId ? "…" : "Registrar"}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Descartar ${item.name}`}
                onClick={() => onDismiss(item.recurringItemId)}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
