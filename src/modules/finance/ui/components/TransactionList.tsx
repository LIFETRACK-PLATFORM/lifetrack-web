"use client";

import { Icon, type IconName } from "@/shared/ui/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transaction } from "@/modules/finance/domain/Transaction";
import { Account } from "@/modules/finance/domain/Account";
import { Category } from "@/modules/finance/domain/Category";
import {
  DEFAULT_COLOR_BY_KIND,
  DEFAULT_ICON_BY_KIND,
} from "@/modules/finance/domain/categoryIcons";
import { formatMoney } from "@/modules/finance/domain/formatMoney";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function TransactionList({
  transactions,
  accounts,
  categories,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";
  const categoryIcon = (id: string): IconName => {
    const category = categories.find((c) => c.id === id);
    return (
      (category?.icon as IconName) ||
      DEFAULT_ICON_BY_KIND[category?.kind ?? "EXPENSE"]
    );
  };
  const categoryColor = (id: string): string => {
    const category = categories.find((c) => c.id === id);
    return category?.color || DEFAULT_COLOR_BY_KIND[category?.kind ?? "EXPENSE"];
  };
  const accountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name ?? "—";
  const accountCurrency = (id: string) =>
    accounts.find((a) => a.id === id)?.currency ?? "PEN";

  if (transactions.length === 0) {
    return (
      <p className="text-body-md text-text-3">
        No hay transacciones en este período.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between rounded-lg border border-border/30 bg-surface-2 p-4"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${categoryColor(t.categoryId)}1A`,
                color: categoryColor(t.categoryId),
              }}
            >
              <Icon name={categoryIcon(t.categoryId)} className="text-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-md font-semibold text-text-1">
                {t.description || categoryName(t.categoryId)}
              </p>
              <p className="font-label text-label-md text-text-3">
                {accountName(t.accountId)} · {categoryName(t.categoryId)} ·{" "}
                {formatDate(t.occurredAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p
              className={`font-metric text-metric-sm ${
                t.kind === "INCOME" ? "text-success" : "text-error"
              }`}
            >
              {t.kind === "INCOME" ? "+" : "-"}
              {formatMoney(t.amount, accountCurrency(t.accountId))}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-3"
                  aria-label="Opciones"
                >
                  <Icon name="more_vert" className="text-text-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(t)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-error"
                  onClick={() => onDelete(t)}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
