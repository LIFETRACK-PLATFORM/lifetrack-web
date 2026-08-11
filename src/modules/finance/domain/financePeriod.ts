export function getMonthDateRange(
  month: number,
  year: number,
): { fromDate: string; toDate: string } {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { fromDate: from.toISOString(), toDate: to.toISOString() };
}

export function formatMonthLabel(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function getCurrentPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getPreviousPeriod(
  month: number,
  year: number,
): { month: number; year: number } {
  return month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
}
