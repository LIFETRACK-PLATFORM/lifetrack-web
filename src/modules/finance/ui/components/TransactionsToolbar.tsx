"use client";

import {
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lifetrack/system-design";
import { Account } from "@/modules/finance/domain/Account";
import { Category } from "@/modules/finance/domain/Category";
import { TransactionKind } from "@/modules/finance/domain/Transaction";

export type TransactionKindFilter = "ALL" | TransactionKind;

const KIND_OPTIONS: { id: TransactionKindFilter; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "EXPENSE", label: "Gastos" },
  { id: "INCOME", label: "Ingresos" },
];

const ALL_ACCOUNTS_OPTION = "__all_accounts__";
const ALL_CATEGORIES_OPTION = "__all_categories__";

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

        <Select
          value={accountId || ALL_ACCOUNTS_OPTION}
          onValueChange={(v) =>
            onAccountChange(v === ALL_ACCOUNTS_OPTION ? "" : v)
          }
        >
          <SelectTrigger className="w-auto" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACCOUNTS_OPTION}>Todas las cuentas</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryId || ALL_CATEGORIES_OPTION}
          onValueChange={(v) =>
            onCategoryChange(v === ALL_CATEGORIES_OPTION ? "" : v)
          }
        >
          <SelectTrigger className="w-auto" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_OPTION}>
              Todas las categorías
            </SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
