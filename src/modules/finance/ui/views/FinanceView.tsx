"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { StatusBadge } from "@/components/ui/badge";
import { FinanceRepository } from "@/modules/finance/domain/FinanceRepository";
import { createFinanceRepository } from "@/modules/finance/infrastructure/createFinanceRepository";
import { useFinanceOverview } from "@/modules/finance/ui/hooks/useFinanceOverview";
import { GetBudgetStatusUseCase } from "@/modules/finance/application/GetBudgetStatusUseCase";
import { BudgetStatus } from "@/modules/finance/domain/BudgetStatus";
import { CreateAccountDialog } from "@/modules/finance/ui/components/CreateAccountDialog";
import { CreateCategoryDialog } from "@/modules/finance/ui/components/CreateCategoryDialog";
import { CreateTransactionDialog } from "@/modules/finance/ui/components/CreateTransactionDialog";
import { CreateBudgetDialog } from "@/modules/finance/ui/components/CreateBudgetDialog";

const now = new Date();

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency || "PEN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

type DialogKind = "account" | "category" | "transaction" | "budget" | null;

export function FinanceView({
  repository,
}: { repository?: FinanceRepository } = {}) {
  const activeRepository = useMemo(
    () => repository ?? createFinanceRepository(),
    [repository],
  );
  const { overview, loading, error, reload } =
    useFinanceOverview(activeRepository);

  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [budgetCategoryId, setBudgetCategoryId] = useState<string>("");
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  const closeDialog = () => {
    setOpenDialog(null);
    setSubmitError(null);
  };

  async function loadBudgetStatus(categoryId: string) {
    if (!categoryId) {
      setBudgetStatus(null);
      return;
    }
    setBudgetLoading(true);
    try {
      const useCase = new GetBudgetStatusUseCase(activeRepository);
      const status = await useCase.execute({
        categoryId,
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
      });
      setBudgetStatus(status);
    } catch {
      setBudgetStatus(null);
    } finally {
      setBudgetLoading(false);
    }
  }

  function handleSelectBudgetCategory(categoryId: string) {
    setBudgetCategoryId(categoryId);
    void loadBudgetStatus(categoryId);
  }

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
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!overview) return null;

  const { accounts, categories, transactions } = overview;
  const expenseCategories = categories.filter((c) => c.kind === "EXPENSE");
  const primaryCurrency = accounts[0]?.currency ?? "PEN";
  const totalBalance = accounts
    .filter((a) => a.currency === primaryCurrency)
    .reduce((sum, a) => sum + a.balance, 0);

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";
  const accountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name ?? "—";

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
        </header>

        {/* Balance total */}
        <section className="mb-6 rounded-xl border border-border bg-surface-1 p-6 card-elevation">
          <p className="font-label text-label-md text-text-3">
            Balance total
          </p>
          <p className="font-metric text-metric-xl text-primary">
            {formatMoney(totalBalance, primaryCurrency)}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Cuentas */}
          <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-headline-md">Cuentas</h3>
              <button
                type="button"
                onClick={() => setOpenDialog("account")}
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
                    <p className="text-body-md font-semibold text-text-1">
                      {a.name}
                    </p>
                    <p className="font-label text-label-md text-text-3">
                      {a.type}
                    </p>
                  </div>
                  <p className="font-metric text-metric-sm text-text-1">
                    {formatMoney(a.balance, a.currency)}
                  </p>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-body-md text-text-3">
                  Todavía no tenés cuentas. Creá la primera.
                </p>
              )}
            </div>
          </section>

          {/* Categorías */}
          <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-headline-md">Categorías</h3>
              <button
                type="button"
                onClick={() => setOpenDialog("category")}
                className="flex items-center gap-1 rounded-lg bg-surface-3 px-3 py-1.5 font-label text-label-md text-primary hover:bg-surface-4"
              >
                <Icon name="add" className="text-[16px]" />
                Nueva
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <StatusBadge
                  key={c.id}
                  status={c.kind === "INCOME" ? "active" : "pending"}
                  label={c.name}
                />
              ))}
              {categories.length === 0 && (
                <p className="text-body-md text-text-3">
                  Todavía no tenés categorías. Creá la primera.
                </p>
              )}
            </div>
          </section>

          {/* Presupuesto del mes */}
          <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-headline-md">Presupuesto del mes</h3>
              <button
                type="button"
                onClick={() => setOpenDialog("budget")}
                className="flex items-center gap-1 rounded-lg bg-surface-3 px-3 py-1.5 font-label text-label-md text-primary hover:bg-surface-4"
              >
                <Icon name="add" className="text-[16px]" />
                Nuevo
              </button>
            </div>

            {expenseCategories.length === 0 ? (
              <p className="text-body-md text-text-3">
                Creá una categoría de gasto para poder presupuestarla.
              </p>
            ) : (
              <div className="space-y-4">
                <select
                  value={budgetCategoryId}
                  onChange={(e) => handleSelectBudgetCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
                >
                  <option value="">Elegí una categoría de gasto…</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {budgetLoading && (
                  <p className="text-body-md text-text-3">Cargando…</p>
                )}

                {!budgetLoading && budgetStatus && budgetStatus.budgetAmount > 0 && (
                  <div className="rounded-lg border border-border/30 bg-surface-2 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-label text-label-md text-text-3">
                        Gastado / Presupuestado
                      </p>
                      <StatusBadge
                        status={budgetStatus.exceeded ? "overdue" : "active"}
                        label={budgetStatus.exceeded ? "Excedido" : "En rango"}
                      />
                    </div>
                    <p className="font-metric text-metric-lg text-text-1">
                      {formatMoney(budgetStatus.spentAmount, primaryCurrency)}{" "}
                      <span className="text-body-md font-normal text-text-3">
                        / {formatMoney(budgetStatus.budgetAmount, primaryCurrency)}
                      </span>
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                      <div
                        className={`h-full rounded-full ${
                          budgetStatus.exceeded ? "bg-error" : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (budgetStatus.spentAmount /
                              budgetStatus.budgetAmount) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {!budgetLoading &&
                  budgetCategoryId &&
                  budgetStatus &&
                  budgetStatus.budgetAmount === 0 && (
                    <p className="text-body-md text-text-3">
                      Esta categoría no tiene presupuesto este mes todavía.
                    </p>
                  )}
              </div>
            )}
          </section>

          {/* Transacciones */}
          <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-headline-md">Transacciones recientes</h3>
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
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-border/30 bg-surface-2 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        t.kind === "INCOME"
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      <Icon
                        name={
                          t.kind === "INCOME" ? "trending_down" : "payments"
                        }
                        className={`text-[18px] ${t.kind === "INCOME" ? "rotate-180" : ""}`}
                      />
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-text-1">
                        {t.description || categoryName(t.categoryId)}
                      </p>
                      <p className="font-label text-label-md text-text-3">
                        {accountName(t.accountId)} · {categoryName(t.categoryId)}{" "}
                        · {formatDate(t.occurredAt)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-metric text-metric-sm ${
                      t.kind === "INCOME" ? "text-success" : "text-error"
                    }`}
                  >
                    {t.kind === "INCOME" ? "+" : "-"}
                    {formatMoney(t.amount, primaryCurrency)}
                  </p>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-body-md text-text-3">
                  Todavía no registraste ninguna transacción.
                </p>
              )}
            </div>
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
                err instanceof Error
                  ? err.message
                  : "No se pudo crear la categoría",
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
              if (input.categoryId === budgetCategoryId) {
                void loadBudgetStatus(budgetCategoryId);
              }
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error
                  ? err.message
                  : "No se pudo crear la transacción",
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
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (input) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await activeRepository.createBudget(input);
              handleSelectBudgetCategory(input.categoryId);
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error
                  ? err.message
                  : "No se pudo crear el presupuesto",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </main>
  );
}
