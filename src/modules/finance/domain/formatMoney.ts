export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency || "PEN",
    maximumFractionDigits: 2,
  }).format(amount);
}
