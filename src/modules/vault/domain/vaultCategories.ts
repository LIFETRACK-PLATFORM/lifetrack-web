export const VAULT_CATEGORIES = [
  "Personal",
  "Trabajo",
  "Finanzas",
  "Redes sociales",
  "Streaming",
  "Otros",
] as const;

export type VaultCategory = string;

export const DEFAULT_VAULT_CATEGORY: VaultCategory = "Personal";

const PRESET_VAULT_CATEGORY_ICONS: Record<string, string> = {
  Personal: "person",
  Trabajo: "work",
  Finanzas: "payments",
  "Redes sociales": "groups",
  Streaming: "play_circle",
  Otros: "folder",
};

const FALLBACK_CATEGORY_ICON = "folder";

export function getCategoryIcon(category: string): string {
  return PRESET_VAULT_CATEGORY_ICONS[category] ?? FALLBACK_CATEGORY_ICON;
}

export function normalizeVaultCategory(category?: string): VaultCategory {
  const trimmed = category?.trim();
  return trimmed || DEFAULT_VAULT_CATEGORY;
}

export function getCategorySortIndex(category: string): number {
  const index = VAULT_CATEGORIES.indexOf(
    category as (typeof VAULT_CATEGORIES)[number],
  );
  return index >= 0 ? index : VAULT_CATEGORIES.length;
}
