export type RecurringMode = "AUTO" | "REMIND";

export interface RecurringItem {
  recurringItemId: string;
  name: string;
  amount: number;
  kind: "INCOME" | "EXPENSE";
  accountId: string;
  categoryId: string;
  dayOfMonth: number;
  mode: RecurringMode;
  active: boolean;
}
