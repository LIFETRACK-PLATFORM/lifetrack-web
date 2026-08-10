"use client";

import { MoreHorizontal } from "lucide-react";
import { Icon, type IconName } from "@/shared/ui/Icon";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lifetrack/system-design";
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
    <div className="flex flex-col gap-3.5">
      {transactions.map((t) => {
        const color = categoryColor(t.categoryId);
        const isIncome = t.kind === "INCOME";
        return (
          <div key={t.id} className="flex items-center gap-3">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                color,
              }}
            >
              <Icon name={categoryIcon(t.categoryId)} className="text-[15px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md text-text-1">
                {t.description || categoryName(t.categoryId)}
              </p>
              <p className="truncate font-label text-label-md text-text-3">
                {accountName(t.accountId)} · {categoryName(t.categoryId)} ·{" "}
                {formatDate(t.occurredAt)}
              </p>
            </div>
            <p
              className={`shrink-0 font-metric text-body-md ${
                isIncome ? "text-success" : "text-error"
              }`}
            >
              {isIncome ? "+" : "-"}
              {formatMoney(t.amount, accountCurrency(t.accountId))}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Opciones"
                >
                  <MoreHorizontal />
                </Button>
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
        );
      })}
    </div>
  );
}
