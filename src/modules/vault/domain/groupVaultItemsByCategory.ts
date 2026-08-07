import {
  getCategorySortIndex,
  normalizeVaultCategory,
} from "./vaultCategories";

export function groupVaultItemsByCategory<T extends { category?: string; site: string }>(
  items: T[],
): Array<{ category: string; items: T[] }> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const category = normalizeVaultCategory(item.category);
    const bucket = groups.get(category) ?? [];
    bucket.push(item);
    groups.set(category, bucket);
  }

  return Array.from(groups.entries())
    .sort(
      ([left], [right]) =>
        getCategorySortIndex(left) - getCategorySortIndex(right) ||
        left.localeCompare(right, "es"),
    )
    .map(([category, groupedItems]) => ({
      category,
      items: groupedItems.sort((a, b) => a.site.localeCompare(b.site, "es")),
    }));
}
