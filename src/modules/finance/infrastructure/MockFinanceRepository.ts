import { Account } from "../domain/Account";
import { Category } from "../domain/Category";
import { Transaction } from "../domain/Transaction";
import { BudgetStatus } from "../domain/BudgetStatus";
import { BudgetListItem } from "../domain/BudgetListItem";
import { MonthlySummary } from "../domain/MonthlySummary";
import { RecurringItem } from "../domain/RecurringItem";
import { ProcessRecurringResult } from "../domain/ProcessRecurringResult";
import { Debt } from "../domain/Debt";
import { DebtCurrencySummary } from "../domain/DebtsSummary";
import {
  CreateAccountInput,
  CreateBudgetInput,
  CreateCategoryInput,
  CreateDebtInput,
  CreateRecurringItemInput,
  CreateTransactionInput,
  DeleteDebtResult,
  FinanceRepository,
  GetBudgetStatusInput,
  GetDebtsSummaryInput,
  GetMonthlySummaryInput,
  ListBudgetsInput,
  RecurringCandidate,
  RegisterDebtPaymentInput,
  RegisterDebtPaymentResult,
  TransactionFilters,
  UpdateAccountInput,
  UpdateBudgetInput,
  UpdateCategoryInput,
  UpdateDebtInput,
  UpdateRecurringItemInput,
  UpdateTransactionInput,
} from "../domain/FinanceRepository";

const RECURRING_AMOUNT_TOLERANCE_RATIO = 0.15;
const RECURRING_MAX_DAY_SPREAD = 5;

const accounts: Account[] = [
  new Account(
    { name: "Ahorros", type: "BANK", currency: "PEN", balance: 1250 },
    "mock-account-1",
  ),
  new Account(
    { name: "Dólares", type: "BANK", currency: "USD", balance: 320 },
    "mock-account-3",
  ),
  new Account(
    { name: "Efectivo", type: "CASH", currency: "PEN", balance: 180 },
    "mock-account-2",
  ),
];

const categories: Category[] = [
  new Category(
    { name: "Comida", kind: "EXPENSE", color: "#F97316" },
    "mock-category-1",
  ),
  new Category(
    { name: "Transporte", kind: "EXPENSE", color: "#3B82F6" },
    "mock-category-3",
  ),
  new Category({ name: "Sueldo", kind: "INCOME", color: "#22C55E" }, "mock-category-2"),
];

const now = new Date();
const thisMonth = now.getMonth();
const thisYear = now.getFullYear();

function isoInMonth(day: number, month = thisMonth, year = thisYear): string {
  return new Date(year, month, day, 12).toISOString();
}

const transactions: Transaction[] = [
  new Transaction(
    {
      accountId: "mock-account-1",
      categoryId: "mock-category-1",
      amount: 85,
      kind: "EXPENSE",
      description: "Supermercado",
      occurredAt: isoInMonth(now.getDate()),
      accountBalanceAfter: 1250,
      budgetExceeded: false,
    },
    "mock-tx-1",
  ),
  new Transaction(
    {
      accountId: "mock-account-1",
      categoryId: "mock-category-2",
      amount: 3500,
      kind: "INCOME",
      description: "Sueldo",
      occurredAt: isoInMonth(1),
      accountBalanceAfter: 3500,
      budgetExceeded: false,
    },
    "mock-tx-2",
  ),
  new Transaction(
    {
      accountId: "mock-account-3",
      categoryId: "mock-category-1",
      amount: 45,
      kind: "EXPENSE",
      description: "Almuerzo",
      occurredAt: isoInMonth(5),
      accountBalanceAfter: 320,
      budgetExceeded: false,
    },
    "mock-tx-3",
  ),
];

interface BudgetRecord {
  budgetId: string;
  categoryId: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
}

const budgets: BudgetRecord[] = [
  {
    budgetId: "mock-budget-1",
    categoryId: "mock-category-1",
    amount: 500,
    periodMonth: thisMonth + 1,
    periodYear: thisYear,
  },
];

const recurringItems: RecurringItem[] = [
  {
    recurringItemId: "mock-recurring-1",
    name: "Alquiler",
    amount: 1200,
    kind: "EXPENSE",
    accountId: "mock-account-1",
    categoryId: "mock-category-1",
    dayOfMonth: 5,
    mode: "REMIND",
    active: true,
  },
];

const debts: Debt[] = [
  {
    debtId: "mock-debt-1",
    name: "Tarjeta BCP",
    lender: "BCP",
    type: "CREDIT_CARD",
    currency: "PEN",
    totalOwed: 1800,
    originalAmount: 2500,
    minimumPayment: 200,
    dueDay: 15,
    accountId: "mock-account-1",
    categoryId: "mock-category-1",
    status: "ACTIVE",
  },
];

function inDateRange(iso: string, fromDate?: string, toDate?: string): boolean {
  const t = new Date(iso).getTime();
  if (fromDate && t < new Date(fromDate).getTime()) return false;
  if (toDate && t > new Date(toDate).getTime()) return false;
  return true;
}

function inPeriod(iso: string, month: number, year: number): boolean {
  const d = new Date(iso);
  return d.getMonth() + 1 === month && d.getFullYear() === year;
}

function updateAccountBalance(accountId: string, delta: number) {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return 0;
  const newBalance = account.balance + delta;
  const idx = accounts.indexOf(account);
  accounts[idx] = new Account(
    {
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: newBalance,
    },
    account.id,
  );
  return newBalance;
}

export class MockFinanceRepository implements FinanceRepository {
  async getAccounts(): Promise<Account[]> {
    return [...accounts];
  }

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const account = new Account(
      {
        name: input.name,
        type: input.type,
        currency: input.currency,
        balance: input.initialBalance,
      },
      crypto.randomUUID(),
    );
    accounts.push(account);
    return account;
  }

  async updateAccount(
    accountId: string,
    input: UpdateAccountInput,
  ): Promise<Account> {
    const idx = accounts.findIndex((a) => a.id === accountId);
    if (idx < 0) throw new Error("Cuenta no encontrada");
    const prev = accounts[idx];
    const updated = new Account(
      {
        name: input.name,
        type: input.type,
        currency: input.currency,
        balance: prev.balance,
      },
      accountId,
    );
    accounts[idx] = updated;
    return updated;
  }

  async deleteAccount(accountId: string): Promise<void> {
    const hasTx = transactions.some((t) => t.accountId === accountId);
    if (hasTx) throw new Error("La cuenta tiene transacciones asociadas");
    const idx = accounts.findIndex((a) => a.id === accountId);
    if (idx >= 0) accounts.splice(idx, 1);
  }

  async getCategories(): Promise<Category[]> {
    return [...categories];
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const category = new Category(
      {
        name: input.name,
        kind: input.kind,
        icon: input.icon,
        color: input.color,
      },
      crypto.randomUUID(),
    );
    categories.push(category);
    return category;
  }

  async updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    const idx = categories.findIndex((c) => c.id === categoryId);
    if (idx < 0) throw new Error("Categoría no encontrada");
    const prev = categories[idx];
    const updated = new Category(
      {
        name: input.name,
        kind: prev.kind,
        icon: input.icon ?? prev.icon,
        color: input.color ?? prev.color,
      },
      categoryId,
    );
    categories[idx] = updated;
    return updated;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const inUse = transactions.some((t) => t.categoryId === categoryId);
    if (inUse) throw new Error("La categoría está en uso");
    const idx = categories.findIndex((c) => c.id === categoryId);
    if (idx >= 0) categories.splice(idx, 1);
  }

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    return transactions.filter(
      (t) =>
        (!filters?.accountId || t.accountId === filters.accountId) &&
        (!filters?.categoryId || t.categoryId === filters.categoryId) &&
        inDateRange(t.occurredAt, filters?.fromDate, filters?.toDate),
    );
  }

  async createTransaction(
    input: CreateTransactionInput,
  ): Promise<Transaction> {
    const delta = input.kind === "INCOME" ? input.amount : -input.amount;
    const newBalance = updateAccountBalance(input.accountId, delta);
    const transaction = new Transaction(
      {
        accountId: input.accountId,
        categoryId: input.categoryId,
        amount: input.amount,
        kind: input.kind,
        description: input.description,
        occurredAt: input.occurredAt,
        accountBalanceAfter: newBalance,
        budgetExceeded: false,
      },
      crypto.randomUUID(),
    );
    transactions.push(transaction);
    return transaction;
  }

  async updateTransaction(
    transactionId: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    const idx = transactions.findIndex((t) => t.id === transactionId);
    if (idx < 0) throw new Error("Transacción no encontrada");
    const prev = transactions[idx];
    const deltaOld = prev.kind === "INCOME" ? prev.amount : -prev.amount;
    const deltaNew = prev.kind === "INCOME" ? input.amount : -input.amount;
    updateAccountBalance(prev.accountId, deltaNew - deltaOld);
    const account = accounts.find((a) => a.id === prev.accountId);
    const updated = new Transaction(
      {
        accountId: prev.accountId,
        categoryId: prev.categoryId,
        amount: input.amount,
        kind: prev.kind,
        description: input.description,
        occurredAt: input.occurredAt,
        accountBalanceAfter: account?.balance ?? 0,
        budgetExceeded: prev.budgetExceeded,
      },
      transactionId,
    );
    transactions[idx] = updated;
    return updated;
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    const idx = transactions.findIndex((t) => t.id === transactionId);
    if (idx < 0) return;
    const tx = transactions[idx];
    const delta = tx.kind === "INCOME" ? -tx.amount : tx.amount;
    updateAccountBalance(tx.accountId, delta);
    transactions.splice(idx, 1);
  }

  async createBudget(input: CreateBudgetInput): Promise<void> {
    const existing = budgets.findIndex(
      (b) =>
        b.categoryId === input.categoryId &&
        b.periodMonth === input.periodMonth &&
        b.periodYear === input.periodYear,
    );
    if (existing >= 0) {
      budgets[existing] = {
        ...budgets[existing],
        amount: input.amount,
      };
    } else {
      budgets.push({
        budgetId: crypto.randomUUID(),
        ...input,
      });
    }
  }

  async updateBudget(
    budgetId: string,
    input: UpdateBudgetInput,
  ): Promise<void> {
    const idx = budgets.findIndex((b) => b.budgetId === budgetId);
    if (idx < 0) throw new Error("Presupuesto no encontrado");
    budgets[idx] = { ...budgets[idx], amount: input.amount };
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const idx = budgets.findIndex((b) => b.budgetId === budgetId);
    if (idx >= 0) budgets.splice(idx, 1);
  }

  async listBudgets(input: ListBudgetsInput): Promise<BudgetListItem[]> {
    return budgets
      .filter(
        (b) =>
          b.periodMonth === input.periodMonth &&
          b.periodYear === input.periodYear,
      )
      .map(({ budgetId, categoryId, amount, periodMonth, periodYear }) => ({
        budgetId,
        categoryId,
        amount,
        periodMonth,
        periodYear,
      }));
  }

  async getBudgetStatus(input: GetBudgetStatusInput): Promise<BudgetStatus> {
    const budget = budgets.find(
      (b) =>
        b.categoryId === input.categoryId &&
        b.periodMonth === input.periodMonth &&
        b.periodYear === input.periodYear,
    );
    const spentAmount = transactions
      .filter(
        (t) =>
          t.categoryId === input.categoryId &&
          t.kind === "EXPENSE" &&
          inPeriod(t.occurredAt, input.periodMonth, input.periodYear),
      )
      .reduce((sum, t) => sum + t.amount, 0);
    const budgetAmount = budget?.amount ?? 0;
    return {
      categoryId: input.categoryId,
      periodMonth: input.periodMonth,
      periodYear: input.periodYear,
      budgetAmount,
      spentAmount,
      exceeded: budgetAmount > 0 && spentAmount > budgetAmount,
    };
  }

  async getMonthlySummary(
    input: GetMonthlySummaryInput,
  ): Promise<MonthlySummary[]> {
    const monthTx = transactions.filter((t) =>
      inPeriod(t.occurredAt, input.periodMonth, input.periodYear),
    );
    const currencies = [...new Set(accounts.map((a) => a.currency))];
    return currencies.map((currency) => {
      const accountIds = accounts
        .filter((a) => a.currency === currency)
        .map((a) => a.id);
      const filtered = monthTx.filter((t) => accountIds.includes(t.accountId));
      const totalIncome = filtered
        .filter((t) => t.kind === "INCOME")
        .reduce((s, t) => s + t.amount, 0);
      const totalExpense = filtered
        .filter((t) => t.kind === "EXPENSE")
        .reduce((s, t) => s + t.amount, 0);
      const byCategory = new Map<string, number>();
      filtered
        .filter((t) => t.kind === "EXPENSE")
        .forEach((t) => {
          byCategory.set(
            t.categoryId,
            (byCategory.get(t.categoryId) ?? 0) + t.amount,
          );
        });
      return {
        currency,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        expensesByCategory: [...byCategory.entries()].map(
          ([categoryId, amount]) => ({ categoryId, amount }),
        ),
      };
    });
  }

  async getRecurringItems(): Promise<RecurringItem[]> {
    return [...recurringItems];
  }

  async createRecurringItem(
    input: CreateRecurringItemInput,
  ): Promise<RecurringItem> {
    const item: RecurringItem = {
      recurringItemId: crypto.randomUUID(),
      ...input,
      active: true,
    };
    recurringItems.push(item);
    return item;
  }

  async updateRecurringItem(
    recurringItemId: string,
    input: UpdateRecurringItemInput,
  ): Promise<RecurringItem> {
    const idx = recurringItems.findIndex(
      (r) => r.recurringItemId === recurringItemId,
    );
    if (idx < 0) throw new Error("Ítem recurrente no encontrado");
    recurringItems[idx] = { recurringItemId, ...input };
    return recurringItems[idx];
  }

  async deleteRecurringItem(recurringItemId: string): Promise<void> {
    const idx = recurringItems.findIndex(
      (r) => r.recurringItemId === recurringItemId,
    );
    if (idx >= 0) recurringItems.splice(idx, 1);
  }

  async processRecurringItems(): Promise<ProcessRecurringResult> {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const pendingReminders: RecurringItem[] = [];
    const generatedTransactions: Transaction[] = [];

    for (const item of recurringItems.filter((r) => r.active)) {
      if (item.dayOfMonth !== day) continue;
      const already = transactions.some(
        (t) =>
          t.description === item.name &&
          inPeriod(t.occurredAt, month, year) &&
          t.amount === item.amount,
      );
      if (already) continue;

      if (item.mode === "REMIND") {
        pendingReminders.push(item);
      } else {
        const tx = await this.createTransaction({
          accountId: item.accountId,
          categoryId: item.categoryId,
          amount: item.amount,
          kind: item.kind,
          description: item.name,
          occurredAt: today.toISOString(),
        });
        generatedTransactions.push(tx);
      }
    }

    return { pendingReminders, generatedTransactions };
  }

  async detectRecurringCandidates(): Promise<RecurringCandidate[]> {
    const groups = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const key = `${t.accountId}|${t.categoryId}|${t.kind}`;
      const group = groups.get(key);
      if (group) group.push(t);
      else groups.set(key, [t]);
    }

    const candidates: RecurringCandidate[] = [];
    for (const group of groups.values()) {
      for (const cluster of clusterByAmount(group)) {
        if (cluster.length < 2) continue;
        const days = cluster.map((t) => new Date(t.occurredAt).getDate());
        if (Math.max(...days) - Math.min(...days) > RECURRING_MAX_DAY_SPREAD) {
          continue;
        }
        const alreadyDeclared = recurringItems.some(
          (item) =>
            item.accountId === cluster[0].accountId &&
            item.categoryId === cluster[0].categoryId &&
            item.kind === cluster[0].kind,
        );
        if (alreadyDeclared) continue;

        const latest = [...cluster].sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
        )[0];
        candidates.push({
          accountId: latest.accountId,
          categoryId: latest.categoryId,
          amount: latest.amount,
          kind: latest.kind,
          dayOfMonth: Math.min(28, Math.round(median(days))),
          occurrences: cluster.length,
          suggestedName: latest.description ?? "",
          lastOccurredAt: latest.occurredAt,
        });
      }
    }
    return candidates;
  }

  async getDebts(): Promise<Debt[]> {
    return [...debts];
  }

  async createDebt(input: CreateDebtInput): Promise<Debt> {
    const debt: Debt = {
      debtId: crypto.randomUUID(),
      name: input.name,
      lender: input.lender,
      type: input.type,
      currency: input.currency,
      totalOwed: input.totalOwed,
      originalAmount: input.originalAmount,
      minimumPayment: input.minimumPayment,
      dueDay: input.dueDay,
      accountId: input.accountId,
      categoryId: input.categoryId,
      status: "ACTIVE",
    };
    debts.push(debt);
    return debt;
  }

  async updateDebt(debtId: string, input: UpdateDebtInput): Promise<Debt> {
    const idx = debts.findIndex((d) => d.debtId === debtId);
    if (idx < 0) throw new Error("Deuda no encontrada");
    const prev = debts[idx];
    const updated: Debt = {
      ...prev,
      name: input.name,
      lender: input.lender,
      type: input.type,
      currency: input.currency,
      originalAmount: input.originalAmount,
      minimumPayment: input.minimumPayment,
      dueDay: input.dueDay,
      accountId: input.accountId,
      categoryId: input.categoryId,
    };
    debts[idx] = updated;
    return updated;
  }

  async deleteDebt(debtId: string): Promise<DeleteDebtResult> {
    const hasPayments = transactions.some((t) => t.debtId === debtId);
    if (hasPayments) {
      const idx = debts.findIndex((d) => d.debtId === debtId);
      if (idx >= 0) debts[idx] = { ...debts[idx], status: "ARCHIVED" };
      return { deleted: false, archived: true };
    }
    const idx = debts.findIndex((d) => d.debtId === debtId);
    if (idx >= 0) debts.splice(idx, 1);
    return { deleted: true, archived: false };
  }

  async registerDebtPayment(
    debtId: string,
    input: RegisterDebtPaymentInput,
  ): Promise<RegisterDebtPaymentResult> {
    const debtIdx = debts.findIndex((d) => d.debtId === debtId);
    if (debtIdx < 0) throw new Error("Deuda no encontrada");
    const debt = debts[debtIdx];
    const account = accounts.find((a) => a.id === input.accountId);
    if (!account) throw new Error("Cuenta no encontrada");
    if (account.currency !== debt.currency) {
      throw new Error(
        `La cuenta es en ${account.currency} pero la deuda es en ${debt.currency}`,
      );
    }

    const newBalance = updateAccountBalance(input.accountId, -input.amount);
    const transaction = new Transaction(
      {
        accountId: input.accountId,
        categoryId: debt.categoryId,
        amount: input.amount,
        kind: "EXPENSE",
        description: input.description ?? `Pago ${debt.name}`,
        occurredAt: input.occurredAt,
        accountBalanceAfter: newBalance,
        budgetExceeded: false,
        debtId: debt.debtId,
      },
      crypto.randomUUID(),
    );
    transactions.push(transaction);

    const occurredAt = new Date(input.occurredAt);
    const totalOwedAfter = Math.max(0, debt.totalOwed - input.amount);
    const statusAfter = totalOwedAfter === 0 ? "PAID_OFF" : "ACTIVE";
    debts[debtIdx] = {
      ...debt,
      totalOwed: totalOwedAfter,
      status: statusAfter,
      lastPaymentMonth: occurredAt.getMonth() + 1,
      lastPaymentYear: occurredAt.getFullYear(),
    };

    return {
      transactionId: transaction.id,
      debtId: debt.debtId,
      amount: input.amount,
      totalOwedAfter,
      statusAfter,
      accountBalanceAfter: newBalance,
      occurredAt: input.occurredAt,
    };
  }

  async adjustDebtBalance(
    debtId: string,
    newTotalOwed: number,
  ): Promise<Debt> {
    const idx = debts.findIndex((d) => d.debtId === debtId);
    if (idx < 0) throw new Error("Deuda no encontrada");
    const prev = debts[idx];
    const status =
      newTotalOwed === 0
        ? "PAID_OFF"
        : prev.status === "PAID_OFF"
          ? "ACTIVE"
          : prev.status;
    const updated: Debt = { ...prev, totalOwed: newTotalOwed, status };
    debts[idx] = updated;
    return updated;
  }

  async getDebtsSummary(
    input: GetDebtsSummaryInput,
  ): Promise<DebtCurrencySummary[]> {
    const active = debts.filter((d) => d.status === "ACTIVE");
    const byCurrency = new Map<string, DebtCurrencySummary>();
    for (const debt of active) {
      const entry =
        byCurrency.get(debt.currency) ??
        ({
          currency: debt.currency,
          totalOwed: 0,
          totalDueThisPeriod: 0,
          activeCount: 0,
        } satisfies DebtCurrencySummary);
      entry.totalOwed += debt.totalOwed;
      entry.activeCount += 1;
      const paidThisPeriod =
        debt.lastPaymentMonth === input.periodMonth &&
        debt.lastPaymentYear === input.periodYear;
      if (debt.minimumPayment && !paidThisPeriod) {
        entry.totalDueThisPeriod += debt.minimumPayment;
      }
      byCurrency.set(debt.currency, entry);
    }
    return Array.from(byCurrency.values());
  }
}

function clusterByAmount(transactions: Transaction[]): Transaction[][] {
  const sorted = [...transactions].sort((a, b) => a.amount - b.amount);
  const clusters: Transaction[][] = [];
  for (const t of sorted) {
    const current = clusters.at(-1);
    const anchor = current?.[0];
    const withinTolerance =
      anchor &&
      Math.abs(t.amount - anchor.amount) <=
        anchor.amount * RECURRING_AMOUNT_TOLERANCE_RATIO;
    if (current && withinTolerance) current.push(t);
    else clusters.push([t]);
  }
  return clusters;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
