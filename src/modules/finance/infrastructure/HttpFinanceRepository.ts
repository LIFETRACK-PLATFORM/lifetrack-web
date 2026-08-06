import { Account } from "../domain/Account";
import { Category } from "../domain/Category";
import { Transaction } from "../domain/Transaction";
import { BudgetStatus } from "../domain/BudgetStatus";
import {
  CreateAccountInput,
  CreateBudgetInput,
  CreateCategoryInput,
  CreateTransactionInput,
  FinanceRepository,
  GetBudgetStatusInput,
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

  async getTransactions(filters?: {
    accountId?: string;
    categoryId?: string;
  }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.accountId) params.set("accountId", filters.accountId);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
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
}
