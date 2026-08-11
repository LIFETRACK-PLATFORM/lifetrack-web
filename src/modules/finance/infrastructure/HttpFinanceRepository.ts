import { Account } from "../domain/Account";
import { Category } from "../domain/Category";
import { Transaction } from "../domain/Transaction";
import { BudgetStatus } from "../domain/BudgetStatus";
import { BudgetListItem } from "../domain/BudgetListItem";
import { MonthlySummary } from "../domain/MonthlySummary";
import { RecurringItem } from "../domain/RecurringItem";
import { ProcessRecurringResult } from "../domain/ProcessRecurringResult";
import { Debt, DebtStatus, DebtType } from "../domain/Debt";
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
import { financeFetch } from "./http/financeHttpClient";

interface AccountDto {
  accountId: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
}

interface CategoryDto {
  categoryId: string;
  name: string;
  kind: string;
  icon?: string;
  color?: string;
}

interface TransactionDto {
  transactionId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  kind: string;
  description?: string;
  occurredAt: string;
  accountBalanceAfter: number;
  budgetExceeded: boolean;
}

interface BudgetDto {
  budgetId: string;
  categoryId: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
}

interface RecurringItemDto {
  recurringItemId: string;
  name: string;
  amount: number;
  kind: string;
  accountId: string;
  categoryId: string;
  dayOfMonth: number;
  mode: string;
  active: boolean;
}

interface RecurringCandidateDto {
  accountId: string;
  categoryId: string;
  amount: number;
  kind: string;
  dayOfMonth: number;
  occurrences: number;
  suggestedName: string;
  lastOccurredAt: string;
}

interface DebtDto {
  debtId: string;
  name: string;
  lender?: string;
  type: string;
  currency: string;
  totalOwed: number;
  originalAmount?: number;
  minimumPayment?: number;
  dueDay?: number;
  accountId?: string;
  categoryId: string;
  status: string;
  lastPaymentMonth?: number;
  lastPaymentYear?: number;
}

interface DebtCurrencySummaryDto {
  currency: string;
  totalOwed: number;
  totalDueThisPeriod: number;
  activeCount: number;
}

function toAccount(dto: AccountDto): Account {
  return new Account(
    {
      name: dto.name,
      type: dto.type as Account["type"],
      currency: dto.currency,
      balance: dto.balance,
    },
    dto.accountId,
  );
}

function toCategory(dto: CategoryDto): Category {
  return new Category(
    {
      name: dto.name,
      kind: dto.kind as Category["kind"],
      icon: dto.icon || undefined,
      color: dto.color || undefined,
    },
    dto.categoryId,
  );
}

function toTransaction(dto: TransactionDto): Transaction {
  return new Transaction(
    {
      accountId: dto.accountId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      kind: dto.kind as Transaction["kind"],
      description: dto.description || undefined,
      occurredAt: dto.occurredAt,
      accountBalanceAfter: dto.accountBalanceAfter,
      budgetExceeded: dto.budgetExceeded,
    },
    dto.transactionId,
  );
}

function toBudgetListItem(dto: BudgetDto): BudgetListItem {
  return {
    budgetId: dto.budgetId,
    categoryId: dto.categoryId,
    amount: dto.amount,
    periodMonth: dto.periodMonth,
    periodYear: dto.periodYear,
  };
}

function toRecurringItem(dto: RecurringItemDto): RecurringItem {
  return {
    recurringItemId: dto.recurringItemId,
    name: dto.name,
    amount: dto.amount,
    kind: dto.kind as RecurringItem["kind"],
    accountId: dto.accountId,
    categoryId: dto.categoryId,
    dayOfMonth: dto.dayOfMonth,
    mode: dto.mode as RecurringItem["mode"],
    active: dto.active,
  };
}

function toRecurringCandidate(dto: RecurringCandidateDto): RecurringCandidate {
  return {
    accountId: dto.accountId,
    categoryId: dto.categoryId,
    amount: dto.amount,
    kind: dto.kind as RecurringCandidate["kind"],
    dayOfMonth: dto.dayOfMonth,
    occurrences: dto.occurrences,
    suggestedName: dto.suggestedName,
    lastOccurredAt: dto.lastOccurredAt,
  };
}

function toDebt(dto: DebtDto): Debt {
  return {
    debtId: dto.debtId,
    name: dto.name,
    lender: dto.lender,
    type: dto.type as DebtType,
    currency: dto.currency,
    totalOwed: dto.totalOwed,
    originalAmount: dto.originalAmount,
    minimumPayment: dto.minimumPayment,
    dueDay: dto.dueDay,
    accountId: dto.accountId,
    categoryId: dto.categoryId,
    status: dto.status as DebtStatus,
    lastPaymentMonth: dto.lastPaymentMonth,
    lastPaymentYear: dto.lastPaymentYear,
  };
}

function toDebtSummary(dto: DebtCurrencySummaryDto): DebtCurrencySummary {
  return {
    currency: dto.currency,
    totalOwed: dto.totalOwed,
    totalDueThisPeriod: dto.totalDueThisPeriod,
    activeCount: dto.activeCount,
  };
}

export class HttpFinanceRepository implements FinanceRepository {
  async getAccounts(): Promise<Account[]> {
    const { accounts } = await financeFetch<{ accounts: AccountDto[] }>(
      "/finance/accounts",
    );
    return accounts.map(toAccount);
  }

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const dto = await financeFetch<AccountDto>("/finance/accounts", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toAccount(dto);
  }

  async updateAccount(
    accountId: string,
    input: UpdateAccountInput,
  ): Promise<Account> {
    const dto = await financeFetch<AccountDto>(`/finance/accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return toAccount(dto);
  }

  async deleteAccount(accountId: string): Promise<void> {
    await financeFetch(`/finance/accounts/${accountId}`, { method: "DELETE" });
  }

  async getCategories(): Promise<Category[]> {
    const { categories } = await financeFetch<{ categories: CategoryDto[] }>(
      "/finance/categories",
    );
    return categories.map(toCategory);
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const dto = await financeFetch<CategoryDto>("/finance/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toCategory(dto);
  }

  async updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    const dto = await financeFetch<CategoryDto>(
      `/finance/categories/${categoryId}`,
      { method: "PUT", body: JSON.stringify(input) },
    );
    return toCategory(dto);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await financeFetch(`/finance/categories/${categoryId}`, {
      method: "DELETE",
    });
  }

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.accountId) params.set("accountId", filters.accountId);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    if (filters?.fromDate) params.set("fromDate", filters.fromDate);
    if (filters?.toDate) params.set("toDate", filters.toDate);
    const query = params.toString();
    const { transactions } = await financeFetch<{
      transactions: TransactionDto[];
    }>(`/finance/transactions${query ? `?${query}` : ""}`);
    return transactions.map(toTransaction);
  }

  async createTransaction(
    input: CreateTransactionInput,
  ): Promise<Transaction> {
    const dto = await financeFetch<TransactionDto>("/finance/transactions", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toTransaction(dto);
  }

  async updateTransaction(
    transactionId: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    const dto = await financeFetch<TransactionDto>(
      `/finance/transactions/${transactionId}`,
      { method: "PUT", body: JSON.stringify(input) },
    );
    return toTransaction(dto);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    await financeFetch(`/finance/transactions/${transactionId}`, {
      method: "DELETE",
    });
  }

  async createBudget(input: CreateBudgetInput): Promise<void> {
    await financeFetch("/finance/budgets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updateBudget(
    budgetId: string,
    input: UpdateBudgetInput,
  ): Promise<void> {
    await financeFetch(`/finance/budgets/${budgetId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  async deleteBudget(budgetId: string): Promise<void> {
    await financeFetch(`/finance/budgets/${budgetId}`, { method: "DELETE" });
  }

  async listBudgets(input: ListBudgetsInput): Promise<BudgetListItem[]> {
    const params = new URLSearchParams({
      month: String(input.periodMonth),
      year: String(input.periodYear),
    });
    const { budgets } = await financeFetch<{ budgets: BudgetDto[] }>(
      `/finance/budgets?${params.toString()}`,
    );
    return budgets.map(toBudgetListItem);
  }

  async getBudgetStatus(input: GetBudgetStatusInput): Promise<BudgetStatus> {
    const params = new URLSearchParams({
      categoryId: input.categoryId,
      periodMonth: String(input.periodMonth),
      periodYear: String(input.periodYear),
    });
    return financeFetch<BudgetStatus>(
      `/finance/budgets/status?${params.toString()}`,
    );
  }

  async getMonthlySummary(
    input: GetMonthlySummaryInput,
  ): Promise<MonthlySummary[]> {
    const params = new URLSearchParams({
      month: String(input.periodMonth),
      year: String(input.periodYear),
    });
    const { summaries } = await financeFetch<{
      summaries: MonthlySummary[];
    }>(`/finance/summary?${params.toString()}`);
    return summaries;
  }

  async getRecurringItems(): Promise<RecurringItem[]> {
    const { items } = await financeFetch<{ items: RecurringItemDto[] }>(
      "/finance/recurring-items",
    );
    return items.map(toRecurringItem);
  }

  async createRecurringItem(
    input: CreateRecurringItemInput,
  ): Promise<RecurringItem> {
    const dto = await financeFetch<RecurringItemDto>(
      "/finance/recurring-items",
      { method: "POST", body: JSON.stringify(input) },
    );
    return toRecurringItem(dto);
  }

  async updateRecurringItem(
    recurringItemId: string,
    input: UpdateRecurringItemInput,
  ): Promise<RecurringItem> {
    const dto = await financeFetch<RecurringItemDto>(
      `/finance/recurring-items/${recurringItemId}`,
      { method: "PUT", body: JSON.stringify(input) },
    );
    return toRecurringItem(dto);
  }

  async deleteRecurringItem(recurringItemId: string): Promise<void> {
    await financeFetch(`/finance/recurring-items/${recurringItemId}`, {
      method: "DELETE",
    });
  }

  async processRecurringItems(): Promise<ProcessRecurringResult> {
    const result = await financeFetch<{
      pendingReminders: RecurringItemDto[];
      generatedTransactions: TransactionDto[];
    }>("/finance/recurring-items/process", { method: "POST" });
    return {
      pendingReminders: result.pendingReminders.map(toRecurringItem),
      generatedTransactions: result.generatedTransactions.map(toTransaction),
    };
  }

  async detectRecurringCandidates(): Promise<RecurringCandidate[]> {
    const { candidates } = await financeFetch<{
      candidates: RecurringCandidateDto[];
    }>("/finance/recurring-items/detect");
    return candidates.map(toRecurringCandidate);
  }

  async getDebts(): Promise<Debt[]> {
    const { debts } = await financeFetch<{ debts: DebtDto[] }>(
      "/finance/debts",
    );
    return debts.map(toDebt);
  }

  async createDebt(input: CreateDebtInput): Promise<Debt> {
    const dto = await financeFetch<DebtDto>("/finance/debts", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toDebt(dto);
  }

  async updateDebt(debtId: string, input: UpdateDebtInput): Promise<Debt> {
    const dto = await financeFetch<DebtDto>(`/finance/debts/${debtId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return toDebt(dto);
  }

  async deleteDebt(debtId: string): Promise<DeleteDebtResult> {
    return financeFetch<DeleteDebtResult>(`/finance/debts/${debtId}`, {
      method: "DELETE",
    });
  }

  async registerDebtPayment(
    debtId: string,
    input: RegisterDebtPaymentInput,
  ): Promise<RegisterDebtPaymentResult> {
    return financeFetch<RegisterDebtPaymentResult>(
      `/finance/debts/${debtId}/payments`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  async adjustDebtBalance(debtId: string, newTotalOwed: number): Promise<Debt> {
    const dto = await financeFetch<DebtDto>(
      `/finance/debts/${debtId}/balance`,
      { method: "PUT", body: JSON.stringify({ newTotalOwed }) },
    );
    return toDebt(dto);
  }

  async getDebtsSummary(
    input: GetDebtsSummaryInput,
  ): Promise<DebtCurrencySummary[]> {
    const params = new URLSearchParams({
      month: String(input.periodMonth),
      year: String(input.periodYear),
    });
    const { summaries } = await financeFetch<{
      summaries: DebtCurrencySummaryDto[];
    }>(`/finance/debts/summary?${params.toString()}`);
    return summaries.map(toDebtSummary);
  }
}
