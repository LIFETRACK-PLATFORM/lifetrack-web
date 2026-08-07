export const VAULT_CATEGORIES = [
  "Personal",
  "Trabajo",
  "Finanzas",
  "Redes sociales",
  "Streaming",
  "Otros",
] as const;

export type VaultCategory = (typeof VAULT_CATEGORIES)[number];

export const DEFAULT_VAULT_CATEGORY: VaultCategory = "Personal";

export const VAULT_CATEGORY_ICONS: Record<VaultCategory, string> = {
  Personal: "person",
  Trabajo: "work",
  Finanzas: "payments",
  "Redes sociales": "groups",
  Streaming: "play_circle",
  Otros: "folder",
};

export function normalizeVaultCategory(category?: string): VaultCategory {
  const trimmed = category?.trim();
  if (trimmed && VAULT_CATEGORIES.includes(trimmed as VaultCategory)) {
    return trimmed as VaultCategory;
  }
  return DEFAULT_VAULT_CATEGORY;
}

export function getCategorySortIndex(category: string): number {
  const index = VAULT_CATEGORIES.indexOf(category as VaultCategory);
  return index >= 0 ? index : VAULT_CATEGORIES.length;
}
