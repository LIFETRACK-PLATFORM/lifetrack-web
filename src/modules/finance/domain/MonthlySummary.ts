export interface CategoryExpenseSummary {
  categoryId: string;
  amount: number;
}

export interface MonthlySummary {
  currency: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  expensesByCategory: CategoryExpenseSummary[];
}
