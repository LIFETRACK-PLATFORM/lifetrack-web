"use client";

import { Account } from "@/modules/finance/domain/Account";
import { formatMoney } from "@/modules/finance/domain/formatMoney";

export function PatrimonioSection({ accounts }: { accounts: Account[] }) {
  const penTotal = accounts
    .filter((a) => a.currency === "PEN")
    .reduce((sum, a) => sum + a.balance, 0);
  const usdTotal = accounts
    .filter((a) => a.currency === "USD")
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <section className="mb-6 rounded-xl border border-border bg-surface-1 p-6 card-elevation">
      <p className="mb-4 font-label text-label-md text-text-3">Patrimonio</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border/30 bg-surface-2 p-4">
          <p className="font-label text-label-md text-text-3">Soles (PEN)</p>
          <p className="font-metric text-metric-lg text-primary">
            {formatMoney(penTotal, "PEN")}
          </p>
        </div>
        <div className="rounded-lg border border-border/30 bg-surface-2 p-4">
          <p className="font-label text-label-md text-text-3">Dólares (USD)</p>
          <p className="font-metric text-metric-lg text-text-1">
            {formatMoney(usdTotal, "USD")}
          </p>
        </div>
      </div>
    </section>
  );
}
