"use client";

import { MonthlySummary } from "@/modules/finance/domain/MonthlySummary";
import { formatMoney } from "@/modules/finance/domain/formatMoney";

export function MonthlySummarySection({
  summaries,
}: {
  summaries: MonthlySummary[];
}) {
  if (summaries.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
        <h3 className="mb-4 text-headline-md">Resumen del mes</h3>
        <p className="text-body-md text-text-3">Sin movimientos este mes.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
      <h3 className="mb-4 text-headline-md">Resumen del mes</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {summaries.map((s) => (
          <div
            key={s.currency}
            className="rounded-lg border border-border/30 bg-surface-2 p-4"
          >
            <p className="mb-3 font-label text-label-md text-text-3">
              {s.currency}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-label text-label-md text-text-3">Ingresos</p>
                <p className="font-metric text-metric-sm text-success">
                  {formatMoney(s.totalIncome, s.currency)}
                </p>
              </div>
              <div>
                <p className="font-label text-label-md text-text-3">Gastos</p>
                <p className="font-metric text-metric-sm text-error">
                  {formatMoney(s.totalExpense, s.currency)}
                </p>
              </div>
              <div>
                <p className="font-label text-label-md text-text-3">Neto</p>
                <p
                  className={`font-metric text-metric-sm ${
                    s.netAmount >= 0 ? "text-success" : "text-error"
                  }`}
                >
                  {formatMoney(s.netAmount, s.currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
