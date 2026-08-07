import { RecurringItem } from "./RecurringItem";
import { Transaction } from "./Transaction";

export interface ProcessRecurringResult {
  pendingReminders: RecurringItem[];
  generatedTransactions: Transaction[];
}
