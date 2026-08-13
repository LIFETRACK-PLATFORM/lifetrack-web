"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Wallet } from "lucide-react";
import { Icon, type IconName } from "@/shared/ui/Icon";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  KpiCard,
  Skeleton,
} from "@lifetrack/system-design";
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
import { RecurringCandidate } from "@/modules/finance/domain/FinanceRepository";
import { Debt } from "@/modules/finance/domain/Debt";
import {
  CreateDebtInput,
  RegisterDebtPaymentInput,
  UpdateDebtInput,
} from "@/modules/finance/domain/FinanceRepository";
import { isDueSoon, isOverdue } from "@/modules/finance/domain/debtStatus";
import { MonthSelector } from "@/modules/finance/ui/components/MonthSelector";
import { CreateAccountDialog } from "@/modules/finance/ui/components/CreateAccountDialog";
import { CreateCategoryDialog } from "@/modules/finance/ui/components/CreateCategoryDialog";
import { CreateTransactionDialog } from "@/modules/finance/ui/components/CreateTransactionDialog";
import { CreateBudgetDialog } from "@/modules/finance/ui/components/CreateBudgetDialog";
import { TransactionList } from "@/modules/finance/ui/components/TransactionList";
import {
  TransactionsToolbar,
  type TransactionKindFilter,
} from "@/modules/finance/ui/components/TransactionsToolbar";
import { EditTransactionDialog } from "@/modules/finance/ui/components/EditTransactionDialog";
import { EditAccountDialog } from "@/modules/finance/ui/components/EditAccountDialog";
import { EditCategoryDialog } from "@/modules/finance/ui/components/EditCategoryDialog";
import { EditBudgetDialog } from "@/modules/finance/ui/components/EditBudgetDialog";
import { DeleteConfirmDialog } from "@/modules/finance/ui/components/DeleteConfirmDialog";
import { BudgetListSection } from "@/modules/finance/ui/components/BudgetListSection";
import { InsightsSection } from "@/modules/finance/ui/components/InsightsSection";
import { TodaySection } from "@/modules/finance/ui/components/TodaySection";
import {
  CreateRecurringDialog,
  EditRecurringDialog,
  RecurringSection,
} from "@/modules/finance/ui/components/RecurringSection";
import { PendingRemindersBanner } from "@/modules/finance/ui/components/PendingRemindersBanner";
import {
  AdjustDebtBalanceDialog,
  CreateDebtDialog,
  DebtsSection,
  EditDebtDialog,
} from "@/modules/finance/ui/components/DebtsSection";
import { RegisterDebtPaymentDialog } from "@/modules/finance/ui/components/RegisterDebtPaymentDialog";

const FinanceCharts = dynamic(
  () =>
    import("@/modules/finance/ui/components/FinanceCharts").then(
      (m) => m.FinanceCharts,
    ),
  {
    loading: () => (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <Skeleton className="h-[280px] w-full rounded-xl" />
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
  | "debt"
  | null;

type EditTarget =
  | { type: "transaction"; item: Transaction }
  | { type: "account"; item: Account }
  | { type: "category"; item: Category }
  | { type: "budget"; item: BudgetListItem }
  | { type: "recurring"; item: RecurringItem }
  | { type: "debt"; item: Debt }
  | null;

type DeleteTarget =
  | { type: "transaction"; item: Transaction }
  | { type: "account"; item: Account }
  | { type: "category"; item: Category }
  | { type: "budget"; item: BudgetListItem }
  | { type: "debt"; item: Debt }
  | null;

type FinanceTab =
  | "resumen"
  | "movimientos"
  | "cuentas"
  | "planificacion"
  | "deudas";

const FINANCE_TABS: { id: FinanceTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "movimientos", label: "Movimientos" },
  { id: "cuentas", label: "Cuentas y categorías" },
  { id: "planificacion", label: "Planificación" },
  { id: "deudas", label: "Deudas" },
];

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
    previousSummaries,
    budgets,
    recurringItems,
    recurringCandidates,
    debts,
    debtsSummary,
    pendingReminders,
    setPendingReminders,
    todayTransactions,
    loading,
    error,
    reload,
  } = useFinanceData(activeRepository, month, year);

  const [tab, setTab] = useState<FinanceTab>("resumen");
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<TransactionKindFilter>("ALL");
  const [filterAccountId, setFilterAccountId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recurringCandidate, setRecurringCandidate] =
    useState<RecurringCandidate | null>(null);
  const [payDebtTarget, setPayDebtTarget] = useState<Debt | null>(null);
  const [adjustBalanceTarget, setAdjustBalanceTarget] =
    useState<Debt | null>(null);
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const closeDialog = () => {
    setOpenDialog(null);
    setSubmitError(null);
    setRecurringCandidate(null);
  };

  const handlePeriodChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
  };

  const filteredTransactions = useMemo(() => {
    if (!overview) return [];
    const term = search.trim().toLowerCase();
    return overview.transactions.filter((t) => {
      if (filterKind !== "ALL" && t.kind !== filterKind) return false;
      if (filterAccountId && t.accountId !== filterAccountId) return false;
      if (filterCategoryId && t.categoryId !== filterCategoryId) return false;
      if (!term) return true;
      const account = overview.accounts.find((a) => a.id === t.accountId);
      const category = overview.categories.find((c) => c.id === t.categoryId);
      const haystack = [
        t.description ?? "",
        category?.name ?? "",
        account?.name ?? "",
        String(t.amount),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [overview, search, filterKind, filterAccountId, filterCategoryId]);

  const toggleSelect = (t: Transaction) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(t.id)) next.delete(t.id);
      else next.add(t.id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await Promise.all(
        [...selectedIds].map((id) => activeRepository.deleteTransaction(id)),
      );
      setSelectedIds(new Set());
      setSelectMode(false);
      reload();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo eliminar",
      );
    } finally {
      setSubmitting(false);
    }
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
        <Button type="button" onClick={() => reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!overview) return null;

  const { accounts, categories, transactions } = overview;

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  const penTotal = accounts
    .filter((a) => a.currency === "PEN")
    .reduce((sum, a) => sum + a.balance, 0);
  const usdTotal = accounts
    .filter((a) => a.currency === "USD")
    .reduce((sum, a) => sum + a.balance, 0);
  const penSummary = summaries.find((s) => s.currency === "PEN") ?? summaries[0];
  const income = penSummary?.totalIncome ?? 0;
  const expense = penSummary?.totalExpense ?? 0;
  const net = penSummary?.netAmount ?? 0;
  const summaryCurrency = penSummary?.currency ?? "PEN";
  const canCreateTransaction =
    accounts.length > 0 && categories.length > 0;

  const today = new Date();
  const debtsDueCount = debts.filter(
    (d) => isOverdue(d, today) || isDueSoon(d, today),
  ).length;
  const totalDebtOwedPen =
    debtsSummary.find((s) => s.currency === "PEN")?.totalOwed ?? 0;

  return (
    <main className="min-h-screen bg-background p-6 pb-32 text-text-1 md:p-10 md:pb-10">
      <div className="mx-auto flex max-w-app flex-col gap-5">
        <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-text-1">Finanzas</h2>
            <p className="text-body-lg text-text-3">
              Cuentas, gastos e ingresos en un solo lugar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <MonthSelector
              month={month}
              year={year}
              onChange={handlePeriodChange}
            />
            <Button
              type="button"
              size="sm"
              disabled={!canCreateTransaction}
              onClick={() => setOpenDialog("transaction")}
            >
              <Plus />
              Transacción
            </Button>
          </div>
        </header>

        <div className="sticky top-0 z-30 -mx-1 flex gap-2 overflow-x-auto bg-background/95 px-1 py-2 no-scrollbar">
          {FINANCE_TABS.map((item) => {
            const pendingCount =
              item.id === "planificacion"
                ? pendingReminders.length
                : item.id === "deudas"
                  ? debtsDueCount
                  : 0;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2 font-label text-label-md transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-text-3 hover:bg-surface-3 hover:text-text-1"
                }`}
              >
                {item.label}
                {pendingCount > 0 ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {pendingCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {tab === "resumen" && (
          <div className="flex flex-col gap-5">
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <KpiCard
                label="Patrimonio PEN"
                value={formatMoney(penTotal, "PEN")}
                tone="primary"
                sparklinePoints="0,20 20,18 40,16 60,14 80,10 100,8"
              />
              <KpiCard
                label="Patrimonio USD"
                value={formatMoney(usdTotal, "USD")}
                tone="neutral"
                sparklinePoints="0,14 20,14 40,14 60,14 80,14 100,14"
              />
              <KpiCard
                label="Ingresos"
                value={formatMoney(income, summaryCurrency)}
                tone="success"
                sparklinePoints="0,22 20,20 40,18 60,12 80,8 100,4"
              />
              <KpiCard
                label="Gastos"
                value={formatMoney(expense, summaryCurrency)}
                tone="error"
                sparklinePoints="0,8 20,10 40,12 60,16 80,18 100,22"
              />
              <KpiCard
                label="Neto del mes"
                value={formatMoney(net, summaryCurrency)}
                delta={net >= 0 ? "superávit" : "déficit"}
                tone={net >= 0 ? "success" : "error"}
                sparklinePoints="0,6 20,8 40,10 60,14 80,18 100,24"
              />
              <KpiCard
                label="Deuda total"
                value={formatMoney(totalDebtOwedPen, "PEN")}
                tone="error"
                delta={debtsDueCount > 0 ? `${debtsDueCount} por pagar` : undefined}
                sparklinePoints="0,10 20,12 40,14 60,16 80,18 100,20"
              />
            </div>

            <FinanceCharts
              summaries={summaries}
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              month={month}
              year={year}
            />

            <InsightsSection
              summaries={summaries}
              previousSummaries={previousSummaries}
              budgets={budgets}
              categories={categories}
              month={month}
              year={year}
            />

            <TodaySection
              transactions={todayTransactions}
              accounts={accounts}
              categories={categories}
              onEdit={(t) => setEditTarget({ type: "transaction", item: t })}
              onDelete={(t) =>
                setDeleteTarget({ type: "transaction", item: t })
              }
            />
          </div>
        )}

        {tab === "movimientos" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>Transacciones del mes</CardTitle>
                  <p className="mt-1 font-label text-label-md text-text-3">
                    Todos los movimientos del período seleccionado
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={selectMode ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setSelectMode((prev) => !prev);
                      setSelectedIds(new Set());
                    }}
                  >
                    {selectMode ? "Cancelar" : "Seleccionar"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!canCreateTransaction}
                    onClick={() => setOpenDialog("transaction")}
                  >
                    <Plus />
                    Nueva
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TransactionsToolbar
                search={search}
                onSearchChange={setSearch}
                kind={filterKind}
                onKindChange={setFilterKind}
                accountId={filterAccountId}
                onAccountChange={setFilterAccountId}
                categoryId={filterCategoryId}
                onCategoryChange={setFilterCategoryId}
                accounts={accounts}
                categories={categories}
              />

              {selectMode && selectedIds.size > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-2.5">
                  <p className="font-label text-label-md text-text-3">
                    {selectedIds.size} seleccionada
                    {selectedIds.size === 1 ? "" : "s"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-error"
                    disabled={submitting}
                    onClick={handleBulkDelete}
                  >
                    Eliminar
                  </Button>
                </div>
              )}

              <TransactionList
                transactions={filteredTransactions}
                accounts={accounts}
                categories={categories}
                onEdit={(t) => setEditTarget({ type: "transaction", item: t })}
                onDelete={(t) =>
                  setDeleteTarget({ type: "transaction", item: t })
                }
                selectable={selectMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                emptyMessage="No se encontraron transacciones. Probá cambiando los filtros."
              />
            </CardContent>
          </Card>
        )}

        {tab === "cuentas" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
          </div>
        )}

        {tab === "planificacion" && (
          <div className="flex flex-col gap-4">
            {pendingReminders.length > 0 ? (
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
            ) : null}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                categories={categories}
                candidates={recurringCandidates}
                pendingIds={pendingReminders.map((r) => r.recurringItemId)}
                onCreate={() => setOpenDialog("recurring")}
                onEdit={(item) => setEditTarget({ type: "recurring", item })}
                onAddCandidate={(candidate) => {
                  setRecurringCandidate(candidate);
                  setOpenDialog("recurring");
                }}
              />
            </div>
          </div>
        )}

        {tab === "deudas" && (
          <DebtsSection
            debts={debts}
            accounts={accounts}
            onCreate={() => setOpenDialog("debt")}
            onEdit={(debt) => setEditTarget({ type: "debt", item: debt })}
            onDelete={(debt) => setDeleteTarget({ type: "debt", item: debt })}
            onRegisterPayment={(debt) => setPayDebtTarget(debt)}
            onAdjustBalance={(debt) => setAdjustBalanceTarget(debt)}
          />
        )}
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
          initial={
            recurringCandidate
              ? {
                  name: recurringCandidate.suggestedName || undefined,
                  amount: recurringCandidate.amount,
                  kind: recurringCandidate.kind,
                  accountId: recurringCandidate.accountId,
                  categoryId: recurringCandidate.categoryId,
                  dayOfMonth: recurringCandidate.dayOfMonth,
                }
              : undefined
          }
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

      {openDialog === "debt" && (
        <CreateDebtDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          accounts={accounts}
          categories={categories}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input: CreateDebtInput) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.createDebt(input);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo crear la deuda",
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

      {editTarget?.type === "debt" && (
        <EditDebtDialog
          debt={editTarget.item}
          open
          onOpenChange={(open) => !open && setEditTarget(null)}
          accounts={accounts}
          categories={categories}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input: UpdateDebtInput) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.updateDebt(editTarget.item.debtId, input);
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
          onArchive={async () => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.deleteDebt(editTarget.item.debtId);
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo archivar",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {payDebtTarget && (
        <RegisterDebtPaymentDialog
          debt={payDebtTarget}
          open
          onOpenChange={(open) => {
            if (!open) {
              setPayDebtTarget(null);
              setSubmitError(null);
            }
          }}
          accounts={accounts}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input: RegisterDebtPaymentInput) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.registerDebtPayment(
                payDebtTarget.debtId,
                input,
              );
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo registrar el pago",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {adjustBalanceTarget && (
        <AdjustDebtBalanceDialog
          debt={adjustBalanceTarget}
          open
          onOpenChange={(open) => {
            if (!open) {
              setAdjustBalanceTarget(null);
              setSubmitError(null);
            }
          }}
          submitting={submitting}
          error={submitError}
          onSubmit={async (newTotalOwed: number) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.adjustDebtBalance(
                adjustBalanceTarget.debtId,
                newTotalOwed,
              );
              reload();
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "No se pudo ajustar el saldo",
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
                : deleteTarget?.type === "debt"
                  ? "Eliminar deuda"
                  : "Eliminar presupuesto"
        }
        description="Esta acción no se puede deshacer."
        loading={submitting}
        error={submitError}
        onClose={() => {
          setDeleteTarget(null);
          setSubmitError(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setSubmitting(true);
          setSubmitError(null);
          try {
            if (deleteTarget.type === "transaction") {
              await activeRepository.deleteTransaction(deleteTarget.item.id);
            } else if (deleteTarget.type === "account") {
              await activeRepository.deleteAccount(deleteTarget.item.id);
            } else if (deleteTarget.type === "category") {
              await activeRepository.deleteCategory(deleteTarget.item.id);
            } else if (deleteTarget.type === "debt") {
              await activeRepository.deleteDebt(deleteTarget.item.debtId);
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Cuentas</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onCreate}>
            <Plus />
            Nueva
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center gap-3">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
              style={{
                background:
                  "color-mix(in srgb, var(--primary) 15%, transparent)",
                color: "var(--primary)",
              }}
            >
              <Wallet size={15} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md text-text-1">{a.name}</p>
              <p className="font-label text-label-md text-text-3">
                {a.type} · {a.currency}
              </p>
            </div>
            <p className="shrink-0 font-metric text-body-md text-text-1">
              {formatMoney(a.balance, a.currency)}
            </p>
            <RowMenu onEdit={() => onEdit(a)} onDelete={() => onDelete(a)} />
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-body-md text-text-3">
            Todavía no tenés cuentas. Creá la primera.
          </p>
        )}
      </CardContent>
    </Card>
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
  const income = categories.filter((c) => c.kind === "INCOME");
  const expense = categories.filter((c) => c.kind === "EXPENSE");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Categorías</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onCreate}>
            <Plus />
            Nueva
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {categories.length === 0 ? (
          <p className="text-body-md text-text-3">
            Todavía no tenés categorías. Creá la primera.
          </p>
        ) : (
          <>
            {expense.length > 0 ? (
              <CategoryGroup
                label="Gastos"
                items={expense}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : null}
            {income.length > 0 ? (
              <CategoryGroup
                label="Ingresos"
                items={income}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryGroup({
  label,
  items,
  onEdit,
  onDelete,
}: {
  label: string;
  items: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-label text-label-md text-text-3">{label}</p>
      <div className="flex flex-col gap-1">
        {items.map((c) => {
          const hex = c.color || DEFAULT_COLOR_BY_KIND[c.kind];
          return (
            <div
              key={c.id}
              className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2/70"
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  color: hex,
                  backgroundColor: `color-mix(in srgb, ${hex} 16%, transparent)`,
                }}
              >
                <Icon
                  name={(c.icon as IconName) || DEFAULT_ICON_BY_KIND[c.kind]}
                  className="text-[15px]"
                />
              </div>
              <p className="min-w-0 flex-1 truncate text-body-md text-text-1">
                {c.name}
              </p>
              <div className="opacity-60 transition-opacity group-hover:opacity-100">
                <RowMenu
                  onEdit={() => onEdit(c)}
                  onDelete={() => onDelete(c)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
        <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
        <DropdownMenuItem className="text-error" onClick={onDelete}>
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
