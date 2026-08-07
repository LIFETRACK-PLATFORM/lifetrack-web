"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { VaultItem } from "../../domain/VaultItem";
import { normalizeSiteForCopy } from "../../domain/extractDomain";
import { CopyField } from "./CopyField";

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
    if (!confirm(`¿Eliminar la contraseña de ${item.site}?`)) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border/30 bg-surface-2 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <CopyField
            label="Sitio"
            value={normalizeSiteForCopy(item.site)}
            mono
          />

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
    </div>
  );
}
