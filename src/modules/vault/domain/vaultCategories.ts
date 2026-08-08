export const VAULT_CATEGORIES = [
  "Personal",
  "Trabajo",
  "Finanzas",
  "Redes sociales",
  "Streaming",
  "Compras",
  "Juegos",
  "Salud",
  "Educación",
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
  Compras: "shopping_bag",
  Juegos: "games",
  Salud: "heart_pulse",
  Educación: "graduation_cap",
  Otros: "folder",
};

/** Categorías personalizadas (no preestablecidas): ícono genérico distinto de "Otros". */
const FALLBACK_CATEGORY_ICON = "label";

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
