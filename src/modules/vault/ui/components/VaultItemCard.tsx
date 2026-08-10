"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@lifetrack/system-design";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { VaultItem } from "../../domain/VaultItem";
import { formatSiteLabel, getSiteHref } from "../../domain/formatSiteLabel";
import {
  getCategoryIcon,
  normalizeVaultCategory,
} from "../../domain/vaultCategories";
import { CopyField } from "./CopyField";

function formatRelativeDate(isoDate?: string): string | null {
  if (!isoDate) return null;

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Actualizado hoy";
  if (diffDays === 1) return "Actualizado ayer";
  if (diffDays < 7) return `Actualizado hace ${diffDays} días`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Actualizado hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  }

  return `Actualizado el ${date.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export function VaultItemCard({
  item,
  onReveal,
  onEdit,
  onDelete,
  showCategoryBadge = true,
}: {
  item: VaultItem;
  onReveal: (itemId: string) => Promise<string>;
  onEdit: (item: VaultItem) => void;
  onDelete: (itemId: string) => Promise<void>;
  showCategoryBadge?: boolean;
}) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const category = normalizeVaultCategory(item.category);
  const siteLabel = formatSiteLabel(item.site);
  const siteHref = getSiteHref(item.site);
  const updatedLabel = formatRelativeDate(item.updatedAt);

  const handleReveal = async () => {
    if (revealed !== null) {
      setRevealed(null);
      setShowPassword(false);
      return;
    }
    setRevealing(true);
    setRevealError(null);
    try {
      const password = await onReveal(item.id);
      setRevealed(password);
      setShowPassword(true);
    } catch (err) {
      setRevealError(
        err instanceof Error
          ? err.message
          : "No se pudo revelar la contraseña. Verificá tu contraseña maestra.",
      );
    } finally {
      setRevealing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la contraseña de ${siteLabel}?`)) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/40 bg-surface-1 px-3 py-3 transition-colors hover:bg-surface-2/60">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
          <Icon
            name={getCategoryIcon(category) as IconName}
            className="text-[16px]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {siteHref ? (
              <a
                href={siteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-body-md font-medium text-primary hover:underline"
              >
                {siteLabel}
              </a>
            ) : (
              <p className="truncate text-body-md font-medium text-text-1">
                {siteLabel}
              </p>
            )}
            {showCategoryBadge ? (
              <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/8 text-primary">
                {category}
              </Badge>
            ) : null}
          </div>
          <p className="truncate font-label text-label-md text-text-3">
            {item.username}
            {updatedLabel ? ` · ${updatedLabel}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleReveal}
            disabled={revealing || deleting}
            aria-label={revealed !== null ? "Ocultar" : "Revelar contraseña"}
            title={revealed !== null ? "Ocultar" : "Revelar contraseña"}
          >
            {revealed !== null ? <EyeOff /> : <Eye />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(item)}
            disabled={deleting}
            aria-label="Editar"
            title="Editar"
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Eliminar"
            title="Eliminar"
            className="text-text-3 hover:text-error"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {revealed !== null || revealError ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
          <CopyField label="Usuario" value={item.username} mono />
          {revealed !== null ? (
            <div className="flex flex-col gap-2">
              <CopyField
                label="Contraseña"
                value={revealed}
                mono
                masked
                visible={showPassword}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="inline-flex w-fit items-center gap-1.5 font-label text-label-md text-text-3 transition-colors hover:text-text-1"
              >
                {showPassword ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              </button>
            </div>
          ) : null}
          {revealError ? (
            <p className="text-body-md text-error">{revealError}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
