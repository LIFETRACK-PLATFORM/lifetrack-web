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

export function groupVaultItemsByDomain<T extends { site: string }>(
  items: T[],
): Array<{ domain: string; items: T[] }> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const domain = extractDomain(item.site);
    const bucket = groups.get(domain) ?? [];
    bucket.push(item);
    groups.set(domain, bucket);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right, "es"))
    .map(([domain, groupedItems]) => ({
      domain,
      items: groupedItems.sort((a, b) => a.site.localeCompare(b.site, "es")),
    }));
}
