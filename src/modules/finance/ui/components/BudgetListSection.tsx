"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { StatusBadge } from "@lifetrack/system-design";
import { BudgetListItem } from "@/modules/finance/domain/BudgetListItem";
import { Category } from "@/modules/finance/domain/Category";
import { FinanceRepository } from "@/modules/finance/domain/FinanceRepository";
import { GetBudgetStatusUseCase } from "@/modules/finance/application/GetBudgetStatusUseCase";
import { BudgetStatus } from "@/modules/finance/domain/BudgetStatus";
import { formatMoney } from "@/modules/finance/domain/formatMoney";

interface BudgetWithStatus extends BudgetListItem {
  status: BudgetStatus | null;
}

export function BudgetListSection({
  budgets,
  categories,
  month,
  year,
  repository,
  onEdit,
  onDelete,
  onCreate,
}: {
  budgets: BudgetListItem[];
  categories: Category[];
  month: number;
  year: number;
  repository: FinanceRepository;
  onEdit: (budget: BudgetListItem) => void;
  onDelete: (budget: BudgetListItem) => void;
  onCreate: () => void;
}) {
  const cacheKey = `${month}-${year}-${budgets.map((b) => b.budgetId).join(",")}`;
  const [fetchState, setFetchState] = useState<{
    key: string;
    items: BudgetWithStatus[];
  } | null>(null);

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  useEffect(() => {
    if (budgets.length === 0) return;

    let cancelled = false;
    const useCase = new GetBudgetStatusUseCase(repository);
    Promise.all(
      budgets.map(async (budget) => ({
        ...budget,
        status: await useCase.execute({
          categoryId: budget.categoryId,
          periodMonth: month,
          periodYear: year,
        }),
      })),
    ).then((result) => {
      if (!cancelled) setFetchState({ key: cacheKey, items: result });
    });

    return () => {
      cancelled = true;
    };
  }, [budgets, cacheKey, month, year, repository]);

  const loading = budgets.length > 0 && fetchState?.key !== cacheKey;
  const items =
    budgets.length === 0
      ? []
      : fetchState?.key === cacheKey
        ? fetchState.items
        : [];

  return (
    <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-headline-md">Presupuestos del mes</h3>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1 rounded-lg bg-surface-3 px-3 py-1.5 font-label text-label-md text-primary hover:bg-surface-4"
        >
          <Icon name="add" className="text-[16px]" />
          Nuevo
        </button>
      </div>

      {loading && <p className="text-body-md text-text-3">Cargando…</p>}

      {!loading && items.length === 0 && (
        <p className="text-body-md text-text-3">
          No hay presupuestos para este mes.
        </p>
      )}

      <div className="space-y-3">
        {items.map((b) => {
          const status = b.status;
          const spent = status?.spentAmount ?? 0;
          const pct =
            b.amount > 0 ? Math.min(100, (spent / b.amount) * 100) : 0;
          const exceeded = status?.exceeded ?? false;
          return (
            <div
              key={b.budgetId}
              className="rounded-lg border border-border/30 bg-surface-2 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-body-md font-semibold text-text-1">
                  {categoryName(b.categoryId)}
                </p>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={exceeded ? "overdue" : "active"}
                    label={exceeded ? "Excedido" : "En rango"}
                  />
                  <button
                    type="button"
                    onClick={() => onEdit(b)}
                    className="rounded-lg px-2 py-1 font-label text-label-md text-primary hover:bg-surface-3"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(b)}
                    className="rounded-lg px-2 py-1 font-label text-label-md text-error hover:bg-surface-3"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="font-metric text-metric-sm text-text-1">
                {formatMoney(spent, "PEN")}{" "}
                <span className="text-body-md font-normal text-text-3">
                  / {formatMoney(b.amount, "PEN")}
                </span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className={`h-full rounded-full ${exceeded ? "bg-error" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
