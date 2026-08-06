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

const accounts: Account[] = [
  new Account(
    { name: "Ahorros", type: "BANK", currency: "PEN", balance: 1250 },
    "mock-account-1",
  ),
  new Account(
    { name: "Efectivo", type: "CASH", currency: "PEN", balance: 180 },
    "mock-account-2",
  ),
];

const categories: Category[] = [
  new Category({ name: "Comida", kind: "EXPENSE" }, "mock-category-1"),
  new Category({ name: "Sueldo", kind: "INCOME" }, "mock-category-2"),
];

const transactions: Transaction[] = [
  new Transaction(
    {
      accountId: "mock-account-1",
      categoryId: "mock-category-1",
      amount: 85,
      kind: "EXPENSE",
      description: "Supermercado",
      occurredAt: new Date().toISOString(),
      accountBalanceAfter: 1250,
      budgetExceeded: false,
    },
    "mock-tx-1",
  ),
];

const budgets = new Map<string, { amount: number }>();

function budgetKey(categoryId: string, month: number, year: number) {
  return `${categoryId}:${month}:${year}`;
}

export class MockFinanceRepository implements FinanceRepository {
  async getAccounts(): Promise<Account[]> {
    return accounts;
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

  async getCategories(): Promise<Category[]> {
    return categories;
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

  async getTransactions(filters?: {
    accountId?: string;
    categoryId?: string;
  }): Promise<Transaction[]> {
    return transactions.filter(
      (t) =>
        (!filters?.accountId || t.accountId === filters.accountId) &&
        (!filters?.categoryId || t.categoryId === filters.categoryId),
    );
  }

  async createTransaction(
    input: CreateTransactionInput,
  ): Promise<Transaction> {
    const account = accounts.find((a) => a.id === input.accountId);
    const delta = input.kind === "INCOME" ? input.amount : -input.amount;
    const newBalance = (account?.balance ?? 0) + delta;
    if (account) {
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
    }
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

  async deleteTransaction(transactionId: string): Promise<void> {
    const idx = transactions.findIndex((t) => t.id === transactionId);
    if (idx >= 0) transactions.splice(idx, 1);
  }

  async createBudget(input: CreateBudgetInput): Promise<void> {
    budgets.set(
      budgetKey(input.categoryId, input.periodMonth, input.periodYear),
      { amount: input.amount },
    );
  }

  async getBudgetStatus(input: GetBudgetStatusInput): Promise<BudgetStatus> {
    const budget = budgets.get(
      budgetKey(input.categoryId, input.periodMonth, input.periodYear),
    );
    const spentAmount = transactions
      .filter(
        (t) => t.categoryId === input.categoryId && t.kind === "EXPENSE",
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
}
