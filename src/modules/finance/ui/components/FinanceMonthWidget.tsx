"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { Skeleton } from "@lifetrack/system-design";
import { FinanceRepository } from "@/modules/finance/domain/FinanceRepository";
import { createFinanceRepository } from "@/modules/finance/infrastructure/createFinanceRepository";
import { GetMonthlySummaryUseCase } from "@/modules/finance/application/GetMonthlySummaryUseCase";
import { getCurrentPeriod } from "@/modules/finance/domain/financePeriod";
import { formatMoney } from "@/modules/finance/domain/formatMoney";

export function FinanceMonthWidget({
  repository,
}: {
  repository?: FinanceRepository;
}) {
  const activeRepository = useMemo(
    () => repository ?? createFinanceRepository(),
    [repository],
  );
  const { month, year } = getCurrentPeriod();
  const [expense, setExpense] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const useCase = new GetMonthlySummaryUseCase(activeRepository);
    useCase
      .execute({ periodMonth: month, periodYear: year })
      .then((summaries) => {
        if (cancelled) return;
        const pen = summaries.find((s) => s.currency === "PEN");
        setExpense(pen?.totalExpense ?? 0);
      })
      .catch(() => {
        if (!cancelled) setExpense(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeRepository, month, year]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  return (
    <Link
      href="/finance"
      className="flex items-center justify-between rounded-xl border border-border bg-surface-1 p-6 card-elevation transition-all hover:border-primary hover:bg-surface-2"
    >
      <div>
        <p className="font-label text-label-md text-text-3">Gastos del mes (PEN)</p>
        <p className="font-metric text-metric-lg text-error">
          {expense !== null ? formatMoney(expense, "PEN") : "—"}
        </p>
      </div>
      <Icon name="chevron_right" className="text-primary" />
    </Link>
  );
}
