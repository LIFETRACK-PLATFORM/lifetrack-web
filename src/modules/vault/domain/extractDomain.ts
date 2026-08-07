export function extractDomain(site: string): string {
  const trimmed = site.trim().toLowerCase();
  if (!trimmed) return "otros";

  try {
    const url = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    return new URL(url).hostname.replace(/^www\./, "") || trimmed;
  } catch {
    return trimmed.split("/")[0]?.replace(/^www\./, "") ?? trimmed;
  }
}

export function normalizeSiteForCopy(site: string): string {
  const trimmed = site.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("://")) return trimmed;
  return `https://${trimmed}`;
}
