import type { IconName } from "@/shared/ui/Icon";
import type { CategoryKind } from "./Category";

export type CategoryIconOption = {
  value: IconName;
  label: string;
};

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: "utensils", label: "Comida" },
  { value: "car", label: "Transporte" },
  { value: "home", label: "Vivienda" },
  { value: "heart_pulse", label: "Salud" },
  { value: "film", label: "Entretenimiento" },
  { value: "shopping_bag", label: "Compras" },
  { value: "receipt", label: "Servicios" },
  { value: "book_open", label: "Educación" },
  { value: "graduation_cap", label: "Estudios" },
  { value: "plane", label: "Viajes" },
  { value: "gift", label: "Regalos" },
  { value: "paw_print", label: "Mascotas" },
  { value: "fitness_center", label: "Fitness" },
  { value: "payments", label: "Sueldo" },
  { value: "trending_up", label: "Otros ingresos" },
];

export const DEFAULT_ICON_BY_KIND: Record<CategoryKind, IconName> = {
  EXPENSE: "shopping_bag",
  INCOME: "payments",
};

export const CATEGORY_COLOR_OPTIONS: string[] = [
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#ef4444",
  "#06b6d4",
];

export const DEFAULT_COLOR_BY_KIND: Record<CategoryKind, string> = {
  EXPENSE: "#eab308",
  INCOME: "#22c55e",
};
