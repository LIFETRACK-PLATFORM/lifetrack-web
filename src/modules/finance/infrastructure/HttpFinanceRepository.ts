import { Account } from "../domain/Account";
import { Category } from "../domain/Category";
import { Transaction } from "../domain/Transaction";
import { BudgetStatus } from "../domain/BudgetStatus";
import { BudgetListItem } from "../domain/BudgetListItem";
import { MonthlySummary } from "../domain/MonthlySummary";
import { RecurringItem } from "../domain/RecurringItem";
import { ProcessRecurringResult } from "../domain/ProcessRecurringResult";
import {
  CreateAccountInput,
  CreateBudgetInput,
  CreateCategoryInput,
  CreateRecurringItemInput,
  CreateTransactionInput,
  FinanceRepository,
  GetBudgetStatusInput,
  GetMonthlySummaryInput,
  ListBudgetsInput,
  TransactionFilters,
  UpdateAccountInput,
  UpdateBudgetInput,
  UpdateCategoryInput,
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
}
