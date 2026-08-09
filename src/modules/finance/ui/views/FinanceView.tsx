"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { Badge, Skeleton, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@lifetrack/system-design";
import {
  DEFAULT_COLOR_BY_KIND,
  DEFAULT_ICON_BY_KIND,
} from "@/modules/finance/domain/categoryIcons";
import { FinanceRepository } from "@/modules/finance/domain/FinanceRepository";
import { createFinanceRepository } from "@/modules/finance/infrastructure/createFinanceRepository";
import { useFinanceData } from "@/modules/finance/ui/hooks/useFinanceData";
import { getCurrentPeriod } from "@/modules/finance/domain/financePeriod";
import { formatMoney } from "@/modules/finance/domain/formatMoney";
import { Account } from "@/modules/finance/domain/Account";
import { Category } from "@/modules/finance/domain/Category";
import { Transaction } from "@/modules/finance/domain/Transaction";
import { BudgetListItem } from "@/modules/finance/domain/BudgetListItem";
import { RecurringItem } from "@/modules/finance/domain/RecurringItem";
import { MonthSelector } from "@/modules/finance/ui/components/MonthSelector";
import { PatrimonioSection } from "@/modules/finance/ui/components/PatrimonioSection";
import { CreateAccountDialog } from "@/modules/finance/ui/components/CreateAccountDialog";
import { CreateCategoryDialog } from "@/modules/finance/ui/components/CreateCategoryDialog";
import { CreateTransactionDialog } from "@/modules/finance/ui/components/CreateTransactionDialog";
import { CreateBudgetDialog } from "@/modules/finance/ui/components/CreateBudgetDialog";
import { TransactionList } from "@/modules/finance/ui/components/TransactionList";
import { EditTransactionDialog } from "@/modules/finance/ui/components/EditTransactionDialog";
import { EditAccountDialog } from "@/modules/finance/ui/components/EditAccountDialog";
import { EditCategoryDialog } from "@/modules/finance/ui/components/EditCategoryDialog";
import { EditBudgetDialog } from "@/modules/finance/ui/components/EditBudgetDialog";
import { DeleteConfirmDialog } from "@/modules/finance/ui/components/DeleteConfirmDialog";
import { BudgetListSection } from "@/modules/finance/ui/components/BudgetListSection";
import { TodaySection } from "@/modules/finance/ui/components/TodaySection";
import { MonthlySummarySection } from "@/modules/finance/ui/components/MonthlySummarySection";
import {
  CreateRecurringDialog,
  EditRecurringDialog,
  RecurringSection,
} from "@/modules/finance/ui/components/RecurringSection";
import { PendingRemindersBanner } from "@/modules/finance/ui/components/PendingRemindersBanner";
const FinanceCharts = dynamic(
  () =>
    import("@/modules/finance/ui/components/FinanceCharts").then(
      (m) => m.FinanceCharts,
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    ),
    ssr: false,
  },
);

type DialogKind =
  | "account"
  | "category"
  | "transaction"
  | "budget"
  | "recurring"
  | null;

type EditTarget =
  | { type: "transaction"; item: Transaction }
  | { type: "account"; item: Account }
  | { type: "category"; item: Category }
  | { type: "budget"; item: BudgetListItem }
  | { type: "recurring"; item: RecurringItem }
  | null;

type DeleteTarget =
  | { type: "transaction"; item: Transaction }
  | { type: "account"; item: Account }
  | { type: "category"; item: Category }
  | { type: "budget"; item: BudgetListItem }
  | null;

export function FinanceView({
  repository,
}: { repository?: FinanceRepository } = {}) {
  const activeRepository = useMemo(
    () => repository ?? createFinanceRepository(),
    [repository],
  );
  const initial = getCurrentPeriod();
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  const {
    overview,
    summaries,
    budgets,
    recurringItems,
    pendingReminders,
    setPendingReminders,
    todayTransactions,
    loading,
    error,
    reload,
  } = useFinanceData(activeRepository, month, year);

  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const closeDialog = () => {
    setOpenDialog(null);
    setSubmitError(null);
  };

  const handlePeriodChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-text-3">
        Cargando finanzas…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-error">{error}</p>
        <button
          type="button"
          onClick={() => reload()}
          className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!overview) return null;

  const { accounts, categories, transactions } = overview;

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <main className="min-h-screen bg-background p-6 pb-32 text-text-1 md:p-10 md:pb-10">
      <div className="mx-auto max-w-app">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-text-1">Finanzas</h2>
            <p className="text-body-lg text-text-3">
              Tus cuentas, gastos e ingresos en un solo lugar.
            </p>
          </div>
          <MonthSelector month={month} year={year} onChange={handlePeriodChange} />
        </header>

        <PendingRemindersBanner
          reminders={pendingReminders}
          accounts={accounts}
          onRegister={async (item, amount) => {
            await activeRepository.createTransaction({
              accountId: item.accountId,
              categoryId: item.categoryId,
              amount,
              kind: item.kind,
              description: item.name,
              occurredAt: new Date().toISOString(),
            });
            reload();
          }}
          onDismiss={(id) =>
            setPendingReminders((prev) =>
              prev.filter((r) => r.recurringItemId !== id),
            )
          }
        />

        <PatrimonioSection accounts={accounts} />

        <div className="mb-6 space-y-6">
          <MonthlySummarySection summaries={summaries} />
          <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
            <h3 className="mb-4 text-headline-md">Gráficos</h3>
            <FinanceCharts
              summaries={summaries}
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              month={month}
              year={year}
            />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TodaySection
            transactions={todayTransactions}
            accounts={accounts}
            categories={categories}
            onEdit={(t) => setEditTarget({ type: "transaction", item: t })}
            onDelete={(t) => setDeleteTarget({ type: "transaction", item: t })}
          />

          <AccountsSection
            accounts={accounts}
            onCreate={() => setOpenDialog("account")}
            onEdit={(a) => setEditTarget({ type: "account", item: a })}
            onDelete={(a) => setDeleteTarget({ type: "account", item: a })}
          />

          <CategoriesSection
            categories={categories}
            onCreate={() => setOpenDialog("category")}
            onEdit={(c) => setEditTarget({ type: "category", item: c })}
            onDelete={(c) => setDeleteTarget({ type: "category", item: c })}
          />

          <BudgetListSection
            budgets={budgets}
            categories={categories}
            month={month}
            year={year}
            repository={activeRepository}
            onEdit={(b) => setEditTarget({ type: "budget", item: b })}
            onDelete={(b) => setDeleteTarget({ type: "budget", item: b })}
            onCreate={() => setOpenDialog("budget")}
          />

          <RecurringSection
            items={recurringItems}
            accounts={accounts}
            onCreate={() => setOpenDialog("recurring")}
            onEdit={(item) => setEditTarget({ type: "recurring", item })}
          />

          <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-headline-md">Transacciones del mes</h3>
              <button
                type="button"
                onClick={() => setOpenDialog("transaction")}
                disabled={accounts.length === 0 || categories.length === 0}
                className="flex items-center gap-1 rounded-lg bg-surface-3 px-3 py-1.5 font-label text-label-md text-primary hover:bg-surface-4 disabled:opacity-50"
              >
                <Icon name="add" className="text-[16px]" />
                Nueva
              </button>
            </div>
            <TransactionList
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              onEdit={(t) => setEditTarget({ type: "transaction", item: t })}
              onDelete={(t) => setDeleteTarget({ type: "transaction", item: t })}
            />
          </section>
        </div>
      </div>

      {openDialog === "account" && (
        <CreateAccountDialog
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.createAccount(input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo crear la cuenta",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {openDialog === "category" && (
        <CreateCategoryDialog
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.createCategory(input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo crear la categoría",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {openDialog === "transaction" && (
        <CreateTransactionDialog
          accounts={accounts}
          categories={categories}
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.createTransaction(input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo crear la transacción",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {openDialog === "budget" && (
        <CreateBudgetDialog
          categories={categories}
          periodMonth={month}
          periodYear={year}
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.createBudget(input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo crear el presupuesto",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {openDialog === "recurring" && (
        <CreateRecurringDialog
          accounts={accounts}
          categories={categories}
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.createRecurringItem(input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo crear el recurrente",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {editTarget?.type === "transaction" && (
        <EditTransactionDialog
          transaction={editTarget.item}
          onClose={() => setEditTarget(null)}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.updateTransaction(editTarget.item.id, input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo actualizar",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {editTarget?.type === "account" && (
        <EditAccountDialog
          account={editTarget.item}
          onClose={() => setEditTarget(null)}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.updateAccount(editTarget.item.id, input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo actualizar",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {editTarget?.type === "category" && (
        <EditCategoryDialog
          category={editTarget.item}
          onClose={() => setEditTarget(null)}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.updateCategory(editTarget.item.id, input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo actualizar",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {editTarget?.type === "budget" && (
        <EditBudgetDialog
          budget={editTarget.item}
          categoryName={categoryName(editTarget.item.categoryId)}
          onClose={() => setEditTarget(null)}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.updateBudget(editTarget.item.budgetId, input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo actualizar",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {editTarget?.type === "recurring" && (
        <EditRecurringDialog
          item={editTarget.item}
          accounts={accounts}
          categories={categories}
          onClose={() => setEditTarget(null)}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.updateRecurringItem(
                editTarget.item.recurringItemId,
                input,
              );
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo actualizar",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
          onDeactivate={async () => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              const item = editTarget.item;
              await activeRepository.updateRecurringItem(item.recurringItemId, {
                name: item.name,
                amount: item.amount,
                kind: item.kind,
                accountId: item.accountId,
                categoryId: item.categoryId,
                dayOfMonth: item.dayOfMonth,
                mode: item.mode,
                active: false,
              });
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo desactivar",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget?.type === "transaction"
            ? "Eliminar transacción"
            : deleteTarget?.type === "account"
              ? "Eliminar cuenta"
              : deleteTarget?.type === "category"
                ? "Eliminar categoría"
                : "Eliminar presupuesto"
        }
        description="Esta acción no se puede deshacer."
        loading={submitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setSubmitting(true);
          try {
            if (deleteTarget.type === "transaction") {
              await activeRepository.deleteTransaction(deleteTarget.item.id);
            } else if (deleteTarget.type === "account") {
              await activeRepository.deleteAccount(deleteTarget.item.id);
            } else if (deleteTarget.type === "category") {
              await activeRepository.deleteCategory(deleteTarget.item.id);
            } else {
              await activeRepository.deleteBudget(deleteTarget.item.budgetId);
            }
            setDeleteTarget(null);
            reload();
          } catch (err) {
            setSubmitError(
              err instanceof Error ? err.message : "No se pudo eliminar",
            );
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </main>
  );
}

function AccountsSection({
  accounts,
  onCreate,
  onEdit,
  onDelete,
}: {
  accounts: Account[];
  onCreate: () => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-headline-md">Cuentas</h3>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1 rounded-lg bg-surface-3 px-3 py-1.5 font-label text-label-md text-primary hover:bg-surface-4"
        >
          <Icon name="add" className="text-[16px]" />
          Nueva
        </button>
      </div>
      <div className="space-y-2">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-lg border border-border/30 bg-surface-2 p-4"
          >
            <div>
              <p className="text-body-md font-semibold text-text-1">{a.name}</p>
              <p className="font-label text-label-md text-text-3">
                {a.type} · {a.currency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-metric text-metric-sm text-text-1">
                {formatMoney(a.balance, a.currency)}
              </p>
              <RowMenu onEdit={() => onEdit(a)} onDelete={() => onDelete(a)} />
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-body-md text-text-3">
            Todavía no tenés cuentas. Creá la primera.
          </p>
        )}
      </div>
    </section>
  );
}

function CategoriesSection({
  categories,
  onCreate,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-headline-md">Categorías</h3>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1 rounded-lg bg-surface-3 px-3 py-1.5 font-label text-label-md text-primary hover:bg-surface-4"
        >
          <Icon name="add" className="text-[16px]" />
          Nueva
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const hex = c.color || DEFAULT_COLOR_BY_KIND[c.kind];
          return (
            <div key={c.id} className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="gap-1.5 border-transparent"
                style={{ color: hex, backgroundColor: `${hex}1A` }}
              >
                <Icon
                  name={
                    (c.icon as IconName) || DEFAULT_ICON_BY_KIND[c.kind]
                  }
                  className="text-[14px]"
                />
                {c.name}
              </Badge>
              <RowMenu onEdit={() => onEdit(c)} onDelete={() => onDelete(c)} />
            </div>
          );
        })}
        {categories.length === 0 && (
          <p className="text-body-md text-text-3">
            Todavía no tenés categorías. Creá la primera.
          </p>
        )}
      </div>
    </section>
  );
}

function RowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface-3"
          aria-label="Opciones"
        >
          <Icon name="more_vert" className="text-[16px] text-text-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
        <DropdownMenuItem className="text-error" onClick={onDelete}>
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
