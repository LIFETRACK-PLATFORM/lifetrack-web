"use client";

import { SearchInput } from "@lifetrack/system-design";
import { Account } from "@/modules/finance/domain/Account";
import { Category } from "@/modules/finance/domain/Category";
import { TransactionKind } from "@/modules/finance/domain/Transaction";

export type TransactionKindFilter = "ALL" | TransactionKind;

const KIND_OPTIONS: { id: TransactionKindFilter; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "EXPENSE", label: "Gastos" },
  { id: "INCOME", label: "Ingresos" },
];

export function TransactionsToolbar({
  search,
  onSearchChange,
  kind,
  onKindChange,
  accountId,
  onAccountChange,
  categoryId,
  onCategoryChange,
  accounts,
  categories,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  kind: TransactionKindFilter;
  onKindChange: (value: TransactionKindFilter) => void;
  accountId: string;
  onAccountChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  accounts: Account[];
  categories: Category[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        placeholder="Buscar por descripción, categoría, cuenta o monto"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full bg-surface-2 p-1">
          {KIND_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onKindChange(option.id)}
              className={`rounded-full px-3 py-1.5 font-label text-label-md transition-all ${
                kind === option.id
                  ? "bg-primary text-primary-foreground"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <select
          value={accountId}
          onChange={(e) => onAccountChange(e.target.value)}
          className="rounded-lg border border-border bg-surface-1 px-3 py-1.5 font-label text-label-md text-text-1 focus:border-primary focus:outline-none"
        >
          <option value="">Todas las cuentas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-border bg-surface-1 px-3 py-1.5 font-label text-label-md text-text-1 focus:border-primary focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
