import { Account, AccountType } from "./Account";
import { Category, CategoryKind } from "./Category";
import { Transaction, TransactionKind } from "./Transaction";
import { BudgetStatus } from "./BudgetStatus";

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
}

export interface CreateCategoryInput {
  name: string;
  kind: CategoryKind;
  icon?: string;
  color?: string;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId: string;
  amount: number;
  kind: TransactionKind;
  description?: string;
  occurredAt: string;
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
}

export interface GetBudgetStatusInput {
  categoryId: string;
  periodMonth: number;
  periodYear: number;
}

export interface FinanceRepository {
  getAccounts(): Promise<Account[]>;
  createAccount(input: CreateAccountInput): Promise<Account>;
  getCategories(): Promise<Category[]>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
  getTransactions(filters?: {
    accountId?: string;
    categoryId?: string;
  }): Promise<Transaction[]>;
  createTransaction(input: CreateTransactionInput): Promise<Transaction>;
  deleteTransaction(transactionId: string): Promise<void>;
  createBudget(input: CreateBudgetInput): Promise<void>;
  getBudgetStatus(input: GetBudgetStatusInput): Promise<BudgetStatus>;
}
