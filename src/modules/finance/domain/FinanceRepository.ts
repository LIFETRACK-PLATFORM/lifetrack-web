import { Account, AccountType } from "./Account";
import { Category, CategoryKind } from "./Category";
import { Transaction, TransactionKind } from "./Transaction";
import { BudgetStatus } from "./BudgetStatus";
import { BudgetListItem } from "./BudgetListItem";
import { MonthlySummary } from "./MonthlySummary";
import { RecurringItem, RecurringMode } from "./RecurringItem";
import { ProcessRecurringResult } from "./ProcessRecurringResult";

export type AccountCurrency = "PEN" | "USD";

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: AccountCurrency;
  initialBalance: number;
}

export interface UpdateAccountInput {
  name: string;
  type: AccountType;
  currency: AccountCurrency;
}

export interface CreateCategoryInput {
  name: string;
  kind: CategoryKind;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryInput {
  name: string;
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
  recurringItemId?: string;
}

export interface UpdateTransactionInput {
  amount: number;
  description?: string;
  occurredAt: string;
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
}

export interface UpdateBudgetInput {
  amount: number;
}

export interface GetBudgetStatusInput {
  categoryId: string;
  periodMonth: number;
  periodYear: number;
}

export interface ListBudgetsInput {
  periodMonth: number;
  periodYear: number;
}

export interface GetMonthlySummaryInput {
  periodMonth: number;
  periodYear: number;
}

export interface CreateRecurringItemInput {
  name: string;
  amount: number;
  kind: TransactionKind;
  accountId: string;
  categoryId: string;
  dayOfMonth: number;
  mode: RecurringMode;
}

export interface UpdateRecurringItemInput {
  name: string;
  amount: number;
  kind: TransactionKind;
  accountId: string;
  categoryId: string;
  dayOfMonth: number;
  mode: RecurringMode;
  active: boolean;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface FinanceRepository {
  getAccounts(): Promise<Account[]>;
  createAccount(input: CreateAccountInput): Promise<Account>;
  updateAccount(accountId: string, input: UpdateAccountInput): Promise<Account>;
  deleteAccount(accountId: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
  updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<Category>;
  deleteCategory(categoryId: string): Promise<void>;

  getTransactions(filters?: TransactionFilters): Promise<Transaction[]>;
  createTransaction(input: CreateTransactionInput): Promise<Transaction>;
  updateTransaction(
    transactionId: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction>;
  deleteTransaction(transactionId: string): Promise<void>;

  createBudget(input: CreateBudgetInput): Promise<void>;
  updateBudget(budgetId: string, input: UpdateBudgetInput): Promise<void>;
  deleteBudget(budgetId: string): Promise<void>;
  listBudgets(input: ListBudgetsInput): Promise<BudgetListItem[]>;
  getBudgetStatus(input: GetBudgetStatusInput): Promise<BudgetStatus>;

  getMonthlySummary(input: GetMonthlySummaryInput): Promise<MonthlySummary[]>;

  getRecurringItems(): Promise<RecurringItem[]>;
  createRecurringItem(input: CreateRecurringItemInput): Promise<RecurringItem>;
  updateRecurringItem(
    recurringItemId: string,
    input: UpdateRecurringItemInput,
  ): Promise<RecurringItem>;
  deleteRecurringItem(recurringItemId: string): Promise<void>;
  processRecurringItems(): Promise<ProcessRecurringResult>;
}
