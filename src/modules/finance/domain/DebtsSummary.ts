export interface DebtCurrencySummary {
  currency: string;
  totalOwed: number;
  totalDueThisPeriod: number;
  activeCount: number;
}
