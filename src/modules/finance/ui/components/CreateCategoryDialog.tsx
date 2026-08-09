"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { CategoryKind } from "@/modules/finance/domain/Category";
import { CreateCategoryInput } from "@/modules/finance/domain/FinanceRepository";
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
  DEFAULT_COLOR_BY_KIND,
  DEFAULT_ICON_BY_KIND,
} from "@/modules/finance/domain/categoryIcons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@lifetrack/system-design";

export function CreateCategoryDialog({
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (input: CreateCategoryInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CategoryKind>("EXPENSE");
  const [icon, setIcon] = useState<IconName>(DEFAULT_ICON_BY_KIND.EXPENSE);
  const [iconTouched, setIconTouched] = useState(false);
  const [color, setColor] = useState<string>(DEFAULT_COLOR_BY_KIND.EXPENSE);
  const [colorTouched, setColorTouched] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleKindChange = (nextKind: CategoryKind) => {
    setKind(nextKind);
    if (!iconTouched) setIcon(DEFAULT_ICON_BY_KIND[nextKind]);
    if (!colorTouched) setColor(DEFAULT_COLOR_BY_KIND[nextKind]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!name.trim()) {
      setClientError("El nombre de la categoría es obligatorio.");
      return;
    }

    const success = await onSubmit({ name: name.trim(), kind, icon, color });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Nueva categoría
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-3"
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              placeholder="Ej. Comida"
            />
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleKindChange("EXPENSE")}
                className={`flex-1 rounded-lg py-2 font-label text-label-md transition-colors ${
                  kind === "EXPENSE"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-3 text-text-3 hover:bg-surface-4"
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => handleKindChange("INCOME")}
                className={`flex-1 rounded-lg py-2 font-label text-label-md transition-colors ${
                  kind === "INCOME"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-3 text-text-3 hover:bg-surface-4"
                }`}
              >
                Ingreso
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Ícono
            </label>
            <Select
              value={icon}
              onValueChange={(value) => {
                setIcon(value as IconName);
                setIconTouched(true);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí un ícono" />
              </SelectTrigger>
              <SelectContent className="z-[110]">
                {CATEGORY_ICON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <Icon name={option.value} className="text-[16px]" />
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLOR_OPTIONS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={hex}
                  onClick={() => {
                    setColor(hex);
                    setColorTouched(true);
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform ${
                    color === hex
                      ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-surface-1"
                      : ""
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {color === hex && (
                    <Icon name="check" className="text-[14px] text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-label text-label-md text-text-3 hover:bg-surface-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
            >
              {submitting ? "Guardando…" : "Crear categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
