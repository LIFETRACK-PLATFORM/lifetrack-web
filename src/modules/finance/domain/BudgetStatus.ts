export interface BudgetStatus {
  categoryId: string;
  periodMonth: number;
  periodYear: number;
  budgetAmount: number;
  spentAmount: number;
  exceeded: boolean;
}
