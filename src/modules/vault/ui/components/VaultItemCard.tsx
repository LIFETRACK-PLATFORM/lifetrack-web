"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
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
}: {
  item: VaultItem;
  onReveal: (itemId: string) => Promise<string>;
  onEdit: (item: VaultItem) => void;
  onDelete: (itemId: string) => Promise<void>;
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
    <div className="rounded-lg border border-border/30 bg-surface-2 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {siteHref ? (
              <a
                href={siteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-label text-label-lg font-semibold text-primary hover:underline"
              >
                {siteLabel}
              </a>
            ) : (
              <h4 className="truncate font-label text-label-lg font-semibold text-text-1">
                {siteLabel}
              </h4>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-label text-label-md text-primary">
              <Icon
                name={getCategoryIcon(category)}
                className="text-[14px]"
              />
              {category}
            </span>
          </div>
          {updatedLabel && (
            <p className="font-label text-label-md text-text-3">{updatedLabel}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleReveal}
            disabled={revealing || deleting}
            className="rounded-lg p-2 text-text-3 transition-colors hover:bg-surface-3 hover:text-primary disabled:opacity-50"
            title={revealed !== null ? "Ocultar" : "Revelar contraseña"}
          >
            <Icon
              name={revealed !== null ? "visibility_off" : "visibility"}
              className="text-[18px]"
            />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            disabled={deleting}
            className="rounded-lg p-2 text-text-3 transition-colors hover:bg-surface-3 hover:text-text-1 disabled:opacity-50"
            title="Editar"
          >
            <Icon name="edit" className="text-[18px]" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg p-2 text-text-3 transition-colors hover:bg-surface-3 hover:text-error disabled:opacity-50"
            title="Eliminar"
          >
            <Icon name="trash" className="text-[18px]" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <CopyField label="Usuario" value={item.username} mono />

        {revealed !== null && (
          <div className="space-y-2">
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
              className="inline-flex items-center gap-1 font-label text-label-md text-text-3 transition-colors hover:text-text-1"
            >
              <Icon
                name={showPassword ? "visibility_off" : "visibility"}
                className="text-[16px]"
              />
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
          </div>
        )}

        {revealError && (
          <p className="text-body-md text-error">{revealError}</p>
        )}
      </div>
    </div>
  );
}
