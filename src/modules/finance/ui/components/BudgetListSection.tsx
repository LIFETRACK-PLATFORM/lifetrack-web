"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from "@lifetrack/system-design";
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Presupuestos del mes</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onCreate}>
            <Plus />
            Nuevo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading && <p className="text-body-md text-text-3">Cargando…</p>}

        {!loading && items.length === 0 && (
          <p className="text-body-md text-text-3">
            No hay presupuestos para este mes.
          </p>
        )}

        {items.map((b) => {
          const status = b.status;
          const spent = status?.spentAmount ?? 0;
          const pct =
            b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
          const exceeded = status?.exceeded ?? false;
          return (
            <div key={b.budgetId} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-body-md text-text-1">
                  {categoryName(b.categoryId)}
                </p>
                <div className="flex items-center gap-1">
                  <Badge variant={exceeded ? "destructive" : "success"} showDot>
                    {exceeded ? "Excedido" : "En rango"}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(b)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-error"
                    onClick={() => onDelete(b)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
              <Progress
                value={pct}
                indicatorClassName={exceeded ? "lt:bg-error" : undefined}
              />
              <div className="flex justify-between gap-2">
                <span className="font-label text-label-md text-text-3">
                  {formatMoney(spent, "PEN")} / {formatMoney(b.amount, "PEN")}
                </span>
                <span className="font-label text-label-md text-text-3">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
