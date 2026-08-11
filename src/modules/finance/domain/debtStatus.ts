import { Debt } from "./Debt";

const DUE_SOON_THRESHOLD_DAYS = 5;

export function wasPaidThisPeriod(debt: Debt, today: Date): boolean {
  return (
    debt.lastPaymentMonth === today.getMonth() + 1 &&
    debt.lastPaymentYear === today.getFullYear()
  );
}

export function isOverdue(debt: Debt, today: Date): boolean {
  if (debt.status !== "ACTIVE" || !debt.dueDay) return false;
  if (wasPaidThisPeriod(debt, today)) return false;
  return today.getDate() > debt.dueDay;
}

export function isDueSoon(debt: Debt, today: Date): boolean {
  if (debt.status !== "ACTIVE" || !debt.dueDay) return false;
  if (wasPaidThisPeriod(debt, today)) return false;
  if (isOverdue(debt, today)) return false;
  return debt.dueDay - today.getDate() <= DUE_SOON_THRESHOLD_DAYS;
}
