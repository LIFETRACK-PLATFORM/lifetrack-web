export type DebtType = "CREDIT_CARD" | "LOAN" | "OTHER";
export type DebtStatus = "ACTIVE" | "PAID_OFF" | "ARCHIVED";

export interface Debt {
  debtId: string;
  name: string;
  lender?: string;
  type: DebtType;
  currency: string;
  totalOwed: number;
  originalAmount?: number;
  minimumPayment?: number;
  dueDay?: number;
  accountId?: string;
  categoryId: string;
  status: DebtStatus;
  lastPaymentMonth?: number;
  lastPaymentYear?: number;
}
